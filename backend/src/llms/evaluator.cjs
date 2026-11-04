/** @format */

const OpenAI = require("openai");
const { LLMSession } = require("./base.cjs");

class EvaluatorLLM extends LLMSession {
	constructor(instructions, llmOptions, schema) {
		super(instructions, llmOptions);
		this.llm = undefined;
		this.schema = schema;
	}
	/**
	 * @param {RequestInit} options
	 */
	async Connect(options) {
		this.llm = new OpenAI({
			baseURL: this.llmOptions.baseURL,
			apiKey: this.llmOptions.apiKey,
		});
	}
	/**
	 *
	 * @param {RequestInit} options
	 * @returns {string} evaluation
	 */
	async Converse(options) {
		const response_format = {
			type: "json_schema",
			json_schema: {
				name: "evaluation",
				strict: true,
				schema: this.schema,
			},
		};

		try {
			const response = await this.llm.chat.completions.create(
				{
					model: this.llmOptions.model,
					messages: this.messages,
					response_format,
				},
				{
					signal: options.signal,
				},
			);

			const message = response.choices[0].message;
			this.messages.push(message);

			return message.content;
		} catch (error) {
			if (!options.signal.aborted) {
				console.error(error);
			}
		}
	}
}

module.exports = {
	EvaluatorLLM,
};
