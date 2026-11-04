<script setup>
import { inject, shallowRef } from "vue"
import LoadingLottie from "../lotties/LoadingLottie.vue"
import config from "@/config.json"
import { onBeforeRouteLeave, useRoute } from "vue-router"

const route = useRoute()
const taskManager = inject("taskManager")

const taskStage = shallowRef("Loading")
const taskId = route.params.id

const task = taskManager.Get(taskId)
task.Listen("loading", (params) => {
	taskStage.value = params.action
})
onBeforeRouteLeave(() => task.Mute("loading"))

const startingTime = Date.now()
const minTipMessageTimeout = 3000
const maxTipMessageTimeout = 8000
const tipMessages = config.loading.messages
const currentMessage = shallowRef(null)
const minutesElapsed = shallowRef(null)
const secondsElapsed = shallowRef(null)

function DisplayMessage() {
	const randomIndex = Math.round(Math.random() * (tipMessages.length - 1))
	currentMessage.value = tipMessages[randomIndex]
}
function StartLoopingMessages() {
	const timeout =
		Math.random() * (maxTipMessageTimeout - minTipMessageTimeout) + minTipMessageTimeout
	setInterval(() => {
		DisplayMessage()
	}, timeout)
}
function UpdateTimer() {
	const elapsed = Date.now() - startingTime
	minutesElapsed.value = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60))
	secondsElapsed.value = Math.floor((elapsed % (1000 * 60)) / 1000)
		.toString()
		.padStart(2, "0")
}
function StartUpdatingTimer() {
	setInterval(() => {
		UpdateTimer()
	}, 1000)
}

DisplayMessage()
StartLoopingMessages()
UpdateTimer()
StartUpdatingTimer()
</script>

<template>
	<main>
		<div class="background"></div>
		<div class="card">
			<div class="lottieHolder">
				<LoadingLottie></LoadingLottie>
				<p class="time">{{ minutesElapsed }}:{{ secondsElapsed }}</p>
			</div>
			<h3>{{ taskStage }}</h3>
			<p class="tip">{{ currentMessage }}</p>
		</div>
	</main>
</template>

<style scoped>
@keyframes analyze {
	0% {
		background-position-x: -64px;
	}
	50% {
		background-position-x: 64px;
	}
	100% {
		background-position-x: -64px;
	}
}

.time {
	font-family: "DSEG7-Classic" !important;
	opacity: 0.5;
}
.tip {
	animation-name: analyze;
	animation-duration: 2s;
	animation-timing-function: ease-in-out;
	animation-iteration-count: infinite;
	background-image: linear-gradient(90deg, white, rgb(180, 180, 180), white);
	background-clip: text;
	color: transparent;
	opacity: 0.75;
	background-blend-mode: multiply;
}
.lottieHolder {
	position: relative;
	margin-block: 8px;
}
.lottieHolder p {
	padding: 0;
	margin: 0;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
}
.card {
	width: fit-content;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
}
.background {
	background: linear-gradient(#023e8a, #0096c7);
}
</style>
