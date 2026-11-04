/** @format */

const { EvaluatorLLM } = require("../llms/evaluator.cjs");
const { ReporterLLM } = require("../llms/reporter.cjs");
const { Task, InitializeTask, DeleteTask } = require("../tasks.cjs");
const express = require("express");
const router = express.Router();

/**
 *
 * @param {Task} task
 * @param {{}} llmOptions
 * @param {{}} jiraOptions
 * @param {RequestInit} options
 * @returns {{}}
 */
async function Evaluate(task, llmOptions, jiraOptions, options) {
	try {
		task.NextStage("prepare");

		const reportMaxToolCalls = 10;
		const reportInstructions = `Gather data of a Jira project called: ${jiraOptions.projectName}.
					Your task is to create a report. Make sure to get data to evaluate the team's performance, project organization and ability to pivot.
					Use the available tools to get data of the project. Never make assumptions, instead look at the project with your tools.
					You should make a maximum of ${reportMaxToolCalls} tool calls.`;

		const reportLLM = new ReporterLLM(
			reportInstructions,
			llmOptions,
			jiraOptions,
		);
		reportLLM.maxToolCalls = reportMaxToolCalls;
		await reportLLM.Connect({
			signal: options.signal,
		});

		reportLLM.AddEventListener("toolcall", (call) => {
			const action = `Running: ${call.function.name}`;
			task.UpdateListeners(action);
		});

		const report = await reportLLM.Converse({
			signal: options.signal,
		});
		await reportLLM.Close();

		if (report == undefined) {
			console.warn("Failed to build report");
			return;
		}

		task.NextStage("grade");

		const evaluatorInstructions = `Based on the following report, evaluate the team's performance, project organization and ability to pivot in grading ranging from 1 to 100.
					Do not make assumptions and make sure to only use content from the report. The report starts here:`;

		const evaluatorSchema = {
			type: "object",
			properties: {
				overall_score: {
					type: "number",
					description:
						"A number from 1-100, which indicates the overall performance including organization, communication and the rest on the project",
				},
				organizational_score: {
					type: "number",
					description:
						"A number from 1-100, which indicates the organization and documentation quality of the project",
				},
				performance_score: {
					type: "number",
					description:
						"A number from 1-100, which indicates how well the team met deadlines and managed to pivot when necessary",
				},
				improvement_tips: {
					type: "array",
					items: {
						type: "string",
						description:
							"A tip on how to improve the team's scores, including the overall, organizational and performance scores.",
					},
				},
			},
			required: [
				"overall_score",
				"organizational_score",
				"performance_score",
				"improvement_tips",
			],
			additionalProperties: false,
		};

		const evaluatorLLM = new EvaluatorLLM(
			evaluatorInstructions + report,
			llmOptions,
			evaluatorSchema,
		);
		await evaluatorLLM.Connect({
			signal: options.signal,
		});
		const evaluation = await evaluatorLLM.Converse({
			signal: options.signal,
		});

		await evaluatorLLM.Close();

		return evaluation;
	} catch (error) {
		if (!options.signal.aborted) {
			console.log(error);
			throw error;
		}
	}
}

router.post("/api/evaluate", async (req, res) => {
	const controller = new AbortController();
	const taskId = req.body.task_id;

	const task = InitializeTask(taskId, {
		prepare: "Preparing",
		grade: "Grading",
	});

	res.on("close", () => {
		controller.abort();
		DeleteTask(task.id);
		console.log("Request aborted");
	});

	console.log(req.body);

	try {
		const evaluation = await Evaluate(
			task,
			{
				baseURL: req.body.aiHost,
				model: req.body.aiModel,
				apiKey: req.body.aiApiKey || "none",
			},
			{
				url: req.body.jiraURL,
				username: req.body.jiraUsername,
				projectName: req.body.jiraProjectName,
				apiKey: req.body.jiraApiKey,
			},
			{
				signal: controller.signal,
			},
		);
		res.json(evaluation);
	} catch (error) {
		res.status(500).end();
	}
});

module.exports = router;
