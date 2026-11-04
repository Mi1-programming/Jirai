import "./assets/base.css"
import { createApp } from "vue"
import App from "./App.vue"
import Vue3Lottie from "vue3-lottie"
import { ClientSocket } from "./clientSocket"
import { TaskManager } from "./taskManager"
import { router } from "./router"
import { createPinia } from "pinia"

const app = createApp(App)

const clientSocket = new ClientSocket()
clientSocket.Connect()

app.provide("clientSocket", clientSocket)

const taskManager = new TaskManager(clientSocket)

app.provide("taskManager", taskManager)

const pinia = createPinia()

app.use(Vue3Lottie)
app.use(router)
app.use(pinia)

await router.isReady()
app.mount("#app")
