import { createMemoryHistory, createRouter } from "vue-router"
import HomeView from "./components/views/HomeView.vue"
import FeedbackView from "./components/views/FeedbackView.vue"
import LoadingView from "./components/views/LoadingView.vue"
import ErrorView from "./components/views/ErrorView.vue"

const routes = [
	{ path: "/", component: HomeView },
	{ name: "error", path: "/error/:message", component: ErrorView },
	{ name: "feedback", path: "/feedback/:feedback", component: FeedbackView },
	{ name: "loading", path: "/loading/:id", component: LoadingView },
]

export const router = createRouter({
	history: createMemoryHistory(),
	routes,
})
