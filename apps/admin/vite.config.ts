import path from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

const rootDir = import.meta.dirname;

export default defineConfig(({ mode }) => {
	const viteEnv = loadEnv(mode, rootDir, "VITE_");

	return {
		plugins: [
			tanstackRouter({
				target: "react",
				routesDirectory: "./src/routes",
				generatedRouteTree: "./src/routeTree.gen.ts",
			}),
			react(),
		],
		resolve: {
			alias: {
				"@": path.resolve(rootDir, "./src"),
			},
		},
		server: {
			port: 5174,
			strictPort: false,
			proxy: viteEnv.VITE_SERVER_URL
				? {
						"/api": {
							target: viteEnv.VITE_SERVER_URL,
							changeOrigin: true,
							secure: true,
							xfwd: true,
						},
					}
				: undefined,
		},
		test: {
			environment: "jsdom",
			globals: true,
			setupFiles: ["./src/test/setup.ts"],
			css: false,
		},
	};
});
