<script setup></script>

<template>
	<router-view v-slot="{ Component }">
		<transition>
			<component :is="Component" />
		</transition>
	</router-view>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
	transition: opacity 0.25s ease-in;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
