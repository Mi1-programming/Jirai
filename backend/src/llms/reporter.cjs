/** @format */

const OpenAI = require("openai");
const { Client } = require("@modelcontextprotocol/client");
const { StdioClientTransport } = require("@modelcontextprotocol/client/stdio");
const { LLMSession } = require("./base.cjs");

class ReporterLLM extends LLMSession {
	constructor(instructions, llmOptions, jiraOptions) {
		super(instructions, llmOptions);
		this.jiraOptions = jiraOptions;
		this.llm = undefined;
		this.mcp = undefined;
		this.modelTools = {};
		this.maxToolCalls = 10;
		this.maxIterations = 20;
	}
	/**
	 * @param {RequestInit} options
	 */
	async Connect(options) {
		await super.Connect();
		this.llm = new OpenAI({
			baseURL: this.llmOptions.baseURL,
			apiKey: this.llmOptions.apiKey,
		});

		this.mcp = new Client({
			name: "mcp-client",
			version: "1.0.0",
		});

		const transport = new StdioClientTransport({
			command: "uvx",
			args: ["mcp-atlassian"],
			env: {
				JIRA_URL: this.jiraOptions.url ?? "",
				JIRA_USERNAME: this.jiraOptions.username ?? "",
				JIRA_API_TOKEN: this.jiraOptions.apiKey ?? "",
				READ_ONLY_MODE: "true",
			},
		});

		try {
			await this.mcp.connect(transport, {
				signal: options.signal,
			});

			// Get the available tools from the MCP server
			const { tools } = await this.mcp.listTools(
				{},
				{
					signal: options.signal,
				},
			);

			// Convert MCP tool schemas to OpenAI-compatible tool definitions
			this.modelTools = tools.map((tool) => ({
				type: "function",
				function: {
					name: tool.name,
					description: tool.description ?? "",
					parameters: tool.inputSchema,
				},
			}));
		} catch (error) {
			if (!options.signal.aborted) {
				throw error;
			}
		}
	}
	/**
	 *
	 * @param {{}} message
	 * @param {number} toolCallsRemaining
	 * @param {RequestInit} options
	 * @returns
	 */
	async HandleTools(message, toolCallsRemaining, options) {
		for await (const call of message.tool_calls) {
			if (toolCallsRemaining <= 0) {
				console.log("Stopped at the maximum number of tool calls.");

				this.messages.push({
					role: "user",
					content:
						"Maximum tool calls reached. Write the final report now using the data you have gathered.",
				});

				break;
			}
			this.ToolCall(call);

			const args = JSON.parse(call.function.arguments);

			try {
				// Execute the requested tool through MCP
				const result = await this.mcp.callTool(
					{
						name: call.function.name,
						arguments: args,
					},
					{
						signal: options.signal,
					},
				);

				this.messages.push({
					role: "tool",
					tool_call_id: call.id,
					content: JSON.stringify(result.content),
				});
			} catch (error) {
				if (options.signal.aborted) {
					break;
				} else {
					console.error(error);

					this.messages.push({
						role: "tool",
						tool_call_id: call.id,
						content: `Tool call failed: ${error.message}`,
					});
				}
			}
			toolCallsRemaining--;
		}
		return toolCallsRemaining;
	}
	/**
	 *
	 * @param {RequestInit} options
	 * @returns {string} report
	 */
	async Converse(options) {
		// Ask the LLM provider to select and call tools when appropriate

		let toolCallsRemaining = this.maxToolCalls;
		let iterations = 0;
		while (iterations < this.maxIterations) {
			iterations++;

			try {
				const response = await this.llm.chat.completions.create(
					{
						model: this.llmOptions.model,
						messages: this.messages,
						tools: this.modelTools,
						tool_choice: "auto",
					},
					{
						signal: options.signal,
					},
				);

				const message = response.choices[0].message;
				this.messages.push(message);

				if (!message.tool_calls?.length) {
					break;
				}

				toolCallsRemaining = await this.HandleTools(
					message,
					toolCallsRemaining,
					{
						signal: options.signal,
					},
				);

				if (toolCallsRemaining > 0) {
					this.messages.push({
						role: "user",
						content:
							"The tool results are above. Continue the task: call more tools if you still need data, or write the final report.",
					});
				}
			} catch (error) {
				if (options.signal.aborted) {
					break;
				} else {
					console.error(error);
				}
			}
		}

		if (this.messages.length == 0) {
			console.warn("LLM sent no messages");
			return undefined;
		}

		const lastMessage = this.messages[this.messages.length - 1];
		return lastMessage.content;
	}
	async Close() {
		await this.mcp.close();
	}
}

module.exports = {
	ReporterLLM,
};
