<template>
	<Vue3Lottie :animationData="LoadingJSON" :height="128" :width="128" />
</template>

<script>
import { Vue3Lottie } from "vue3-lottie"

import LoadingJSON from "@resources/lotties/loading.json"

export default {
	components: {
		Vue3Lottie,
	},
	data() {
		return {
			LoadingJSON,
		}
	},
}
</script>
