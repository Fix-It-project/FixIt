import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},
	test: {
		globals: true,
		environment: "node",
		root: resolve(__dirname),
		include: ["src/**/tests/**/*.test.ts", "src/**/tests/**/*.spec.ts"],
		setupFiles: ["tests/setup.ts"],
		mockReset: true,
		coverage: {
			reporter: ["text", "html", "lcov"],
		},
	},
});
