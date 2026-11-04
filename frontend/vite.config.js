import { fileURLToPath, URL } from "node:url"

import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"

// https://vite.dev/config/
export default ({ mode }) => {
	const env = loadEnv(mode, ".", "")
	return defineConfig({
		plugins: [vue(), vueDevTools()],
		server: {
			proxy: {
				"/api": {
					target: env.VITE_SERVER_ADDRESS,
					changeOrigin: true,
				},
				"/ws": {
					target: env.VITE_WEBSOCKET_ADDRESS,
					changeOrigin: true,
				},
			},
		},
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
				"@resources": fileURLToPath(new URL("./src/assets/resources", import.meta.url)),
			},
		},
	})
}
