<script setup>
import { router } from "@/router"
import { useConnectionStore } from "@/stores/connectionStore"
import { Task } from "@/taskManager"
import { storeToRefs } from "pinia"
import { inject } from "vue"

const store = useConnectionStore()
const { jiraUsername, jiraURL, jiraProjectName, jiraApiKey, aiHost, aiModel, aiApiKey } =
	storeToRefs(store)

const taskManager = inject("taskManager")

const task = new Task(async (id) => {
	router.push({ name: "loading", params: { id } })
	const data = {
		task_id: id,
		jiraUsername: jiraUsername.value,
		jiraURL: jiraURL.value,
		jiraProjectName: jiraProjectName.value,
		jiraApiKey: jiraApiKey.value,
		aiHost: aiHost.value,
		aiModel: aiModel.value,
		aiApiKey: aiApiKey.value,
	}
	console.log(data)
	const evaluation = await fetch("/api/evaluate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	})
	console.log(evaluation)
	return evaluation
})

function Evaluate() {
	taskManager.Complete(task, async (result) => {
		try {
			if (result.status != 200) {
				const errorText = `${result.status}: ${result.statusText}`
				throw new Error(errorText)
			}

			const data = await result.json()
			router.push({ name: "feedback", params: { feedback: data } })
		} catch (error) {
			console.error(error)
			router.push({ name: "error", params: { message: error.toString() } })
		}
	})
}
</script>

<template>
	<main class="page">
		<div class="background"></div>
		<img class="logo" src="@resources/logo.png" />
		<h1>Jira Project Evaluator</h1>
		<p>Evaluate your project and get tips and tricks for improvement!</p>
		<form>
			<fieldset>
				<legend>Jira Details</legend>
				<div class="formRow">
					<label for="username">Username</label>
					<input
						v-model="jiraUsername"
						type="text"
						name="username"
						placeholder="user.name@atlassian.net"
						autocomplete="on"
					/>
				</div>
				<div class="formRow">
					<label for="url">URL</label>
					<input
						v-model="jiraURL"
						type="url"
						name="url"
						placeholder="https://companyname.atlassian.net"
						autocomplete="on"
					/>
				</div>
				<div class="formRow">
					<label for="project">Project Name</label>
					<input
						v-model="jiraProjectName"
						type="text"
						name="project"
						placeholder="Existing Jira project"
						autocomplete="on"
					/>
				</div>
				<div class="formRow">
					<label for="jiraKey">API Key</label>
					<input v-model="jiraApiKey" type="password" name="jiraKey" />
				</div>
				<p>
					You can aquire an api key for Jira
					<a target="_blank" href="https://id.atlassian.com/manage-profile/security/api-tokens"
						>here</a
					>. <i>Reminder: treat API keys like passwords.</i>
				</p>
			</fieldset>
			<fieldset>
				<legend>Artificial Intellegence Connection</legend>
				<div class="formRow">
					<label for="aiHost">Host</label>
					<input
						v-model="aiHost"
						type="text"
						name="aiHost"
						placeholder="https://openrouter.ai/api/v1"
						autocomplete="on"
					/>
				</div>
				<div class="formRow">
					<label for="aiModel">Model</label>
					<input
						v-model="aiModel"
						type="text"
						name="aiModel"
						placeholder="openrouter/free"
						autocomplete="on"
					/>
				</div>
				<div class="formRow">
					<label for="aiApiKey">API Key</label>
					<input v-model="aiApiKey" type="password" name="aiApiKey" />
				</div>
				<p>
					You can for example use OpenRouter. You can get an API key for it
					<a target="_blank" href="https://openrouter.ai/workspaces/default/keys">here</a>.
				</p>
			</fieldset>
		</form>
		<i>
			<p class="sidenote">
				This application uses LLM agents to grade your Jira project. Output may not always be
				factual or consistent.
			</p>
		</i>
		<div class="tools">
			<button @click="Evaluate">Evaluate Project</button>
		</div>
	</main>
</template>

<style scoped></style>
