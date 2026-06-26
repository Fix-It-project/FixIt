import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";
import "@/styles/globals.css";

// Own scroll on load: the browser otherwise restores the previous scroll Y
// before the lazy mockups load, clamps it to a too-short page, and lands you at
// the bottom. Start at top (or the requested #hash) instead.
if ("scrollRestoration" in history) {
	history.scrollRestoration = "manual";
}
if (!window.location.hash) {
	window.scrollTo(0, 0);
}

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error("Missing #root element in index.html");
}

createRoot(rootEl).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
