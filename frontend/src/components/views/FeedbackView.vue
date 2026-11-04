<script setup>
import { useRoute } from "vue-router"
import ScoreDisplay from "../ScoreDisplay.vue"

const route = useRoute()
const feedback = JSON.parse(route.params.feedback)

const metrics = [
	{
		title: "Overall",
		value: feedback.overall_score,
	},
	{
		title: "Organization",
		value: feedback.organizational_score,
	},
	{
		title: "Performance",
		value: feedback.performance_score,
	},
]
</script>

<template>
	<main class="page">
		<div class="background"></div>
		<h1>Personalized feedback</h1>
		<div class="metrics">
			<div class="metric" v-for="(metric, index) in metrics" v-bind:key="index">
				<label :for="'metric_' + metric.title">{{ metric.title }}</label>
				<ScoreDisplay
					:name="'metric_' + metric.title"
					:score="metric.value"
					max-score="100"
					min-color="red"
					max-color="lime"
				></ScoreDisplay>
			</div>
		</div>
		<details>
			<summary>Personalized Tips</summary>
			<ul>
				<li v-for="(tip, index) in feedback.improvement_tips" v-bind:key="index">{{ tip }}</li>
			</ul>
		</details>
		<div class="tools">
			<RouterLink to="/">
				<button>Evaluate Another Project</button>
			</RouterLink>
		</div>
	</main>
</template>

<style scoped>
ul {
	list-style-type: "→ ";
}
.metrics {
	display: flex;
	justify-content: space-around;
	align-items: center;
	height: 128px;
}
.metric {
	display: flex;
	flex-direction: column;
	align-items: center;
}
</style>
