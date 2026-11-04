import { defineStore } from "pinia"
import { ref } from "vue"

export const useConnectionStore = defineStore("connection", {
	state: () =>
		ref({
			jiraUsername: "",
			jiraURL: "",
			jiraProjectName: "",
			jiraApiKey: "",
			aiHost: "",
			aiModel: "",
			aiApiKey: "",
		}),
})
