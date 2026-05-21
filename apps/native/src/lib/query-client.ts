import { focusManager, QueryClient } from "@tanstack/react-query";
import { AppState, type AppStateStatus, Platform } from "react-native";

const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			retry: false,
		},
		queries: {
			retry: 2,
			// Keep cached data for 30s before considering it stale; this lets
			// foreground/focus invalidation kick in promptly when the app returns
			// from background without making every interaction refetch.
			staleTime: 30 * 1000,
			// Refetch on mount when stale + on screen focus → ensures the UI
			// reflects current server state whenever the user revisits a screen.
			refetchOnMount: true,
			refetchOnReconnect: true,
		},
	},
});

// React Query's `focusManager` is wired to web's window focus event by default.
// On React Native we forward AppState changes so a background→active transition
// triggers `refetchOnWindowFocus` for active queries — the canonical pattern
// from the React Query RN docs. Server is the source of truth; the quote /
// lifecycle UI is driven by these queries.
function onAppStateChange(status: AppStateStatus) {
	if (Platform.OS !== "web") {
		focusManager.setFocused(status === "active");
	}
}

const appStateSubscription = AppState.addEventListener(
	"change",
	onAppStateChange,
);

// Expose for tests / cleanup; in normal app lifetime this lives for the whole
// process and never needs to be removed.
export const __appStateSubscription = appStateSubscription;

export default queryClient;
