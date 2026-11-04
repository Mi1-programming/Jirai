<script setup>
import Color from "colorjs.io"
import { computed } from "vue"

const props = defineProps(["score", "maxScore", "minColor", "maxColor"])
const color = computed(() => {
	const progress = props.score / props.maxScore
	let color = new Color(props.minColor)
	let gradient = color.range(props.maxColor, {
		space: "lch",
		outputSpace: "srgb",
	})
	const interpolatedColor = gradient(progress)

	return interpolatedColor
})
</script>

<template>
	<h2 :style="{ color: color }">{{ score }} / {{ maxScore }}</h2>
</template>

<style scoped></style>
