import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const rootDir = import.meta.dirname;

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(rootDir, "./src"),
		},
	},
	server: {
		port: 5175,
		strictPort: false,
	},
	build: {
		outDir: "dist",
	},
});
