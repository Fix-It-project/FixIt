import { getThemeTokens, getThemeVariableRecord } from "./resolution";
import type { ThemeId } from "./types";

export function applyThemeToDocument(themeId: ThemeId) {
	if (typeof document === "undefined") return;
	const tokens = getThemeTokens(themeId);
	const vars = getThemeVariableRecord(tokens);
	const root = document.documentElement;

	for (const [name, value] of Object.entries(vars)) {
		root.style.setProperty(name, value);
	}

	root.setAttribute("data-theme", themeId);
	root.style.colorScheme = tokens.appearance;
}

export function watchSystemColorScheme(
	callback: (scheme: "light" | "dark") => void,
): () => void {
	if (typeof window === "undefined") return () => undefined;
	const media = window.matchMedia("(prefers-color-scheme: dark)");
	const handler = (event: MediaQueryListEvent) => {
		callback(event.matches ? "dark" : "light");
	};
	media.addEventListener("change", handler);
	return () => media.removeEventListener("change", handler);
}
