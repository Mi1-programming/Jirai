<script setup>
import { useRoute } from "vue-router"

const route = useRoute()
const errorMessage = route.params.message ?? "Error message"
</script>

<template>
	<main class="page">
		<div class="background"></div>
		<h1>Ran into an issue</h1>
		<p class="error">{{ errorMessage }}</p>
		<div class="tools">
			<RouterLink to="/">
				<button>Back</button>
			</RouterLink>
		</div>
	</main>
</template>

<style scoped>
.error {
	color: red;
}
</style>
