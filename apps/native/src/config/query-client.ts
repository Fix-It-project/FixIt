import { showError, toAppError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";
import { isRetryable } from "@FixIt/errors";
import {
	focusManager,
	MutationCache,
	onlineManager,
	QueryCache,
	QueryClient,
} from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState, type AppStateStatus, Platform } from "react-native";

// Noise-control dedupe — bounded by (distinct AppErrorCode) × (distinct queryKey heads).
// Realistic ceiling ~100 entries over a long session. If growth becomes a concern,
// add a periodic prune (entries older than 60s).
const dedupeMap = new Map<string, number>();
const DEDUPE_WINDOW_MS = 2000;

type CacheSource = "query" | "mutation";
type CacheMeta = { showToast?: boolean; background?: boolean } | undefined;

const KNOWN_APP_ERROR_CODES: ReadonlySet<string> = new Set([
	"VALIDATION",
	"CONFLICT",
	"FORBIDDEN",
	"NOT_FOUND",
	"UNAUTHENTICATED",
	"NETWORK",
	"OFFLINE",
	"TIMEOUT",
	"RATE_LIMITED",
	"SERVER",
	"MAINTENANCE",
]);

function extractCauseResponse(
	cause: unknown,
): { status?: number; data?: unknown; url?: string; method?: string } | undefined {
	if (!cause || typeof cause !== "object") return undefined;
	const maybe = cause as {
		response?: { status?: number; data?: unknown };
		config?: { url?: string; method?: string };
	};
	return {
		status: maybe.response?.status,
		data: maybe.response?.data,
		url: maybe.config?.url,
		method: maybe.config?.method,
	};
}

function handleCacheError(
	err: unknown,
	source: CacheSource,
	key: readonly unknown[],
	meta: CacheMeta,
): void {
	const app = toAppError(err);
	const keyHead = String(key[0] ?? "unknown");

	// Known business errors → warn (no Expo red overlay). Unknown / unexpected
	// errors still go through logger.error so real bugs stay visible in dev.
	if (KNOWN_APP_ERROR_CODES.has(app.code)) {
		const causeResponse = extractCauseResponse(app.opts.cause);
		logger.warn(source, keyHead, {
			code: app.code,
			userMessage: app.userMessage,
			token: app.opts.token,
			machineCode: app.opts.token,
			status: app.opts.status,
			devMessage: app.opts.devMessage,
			fields: app.opts.fields,
			details: app.opts.details,
			causeStatus: causeResponse?.status,
			causeUrl: causeResponse?.url,
			causeMethod: causeResponse?.method,
			causeData: causeResponse?.data,
		});
	} else {
		logger.error(source, keyHead, err);
	}

	if (meta?.showToast === false) return;
	if (meta?.background === true) return;
	if (app.code === "UNAUTHENTICATED") return;
	if (
		app.code === "VALIDATION" ||
		app.code === "FORBIDDEN" ||
		app.code === "NOT_FOUND"
	)
		return;
	if (app.code === "NETWORK" || app.code === "OFFLINE" || app.code === "TIMEOUT")
		return;

	const dedupeKey = `${app.code}:${keyHead}`;
	const now = Date.now();
	const last = dedupeMap.get(dedupeKey);
	if (last !== undefined && now - last < DEDUPE_WINDOW_MS) return;
	dedupeMap.set(dedupeKey, now);

	showError(app);
}

const queryCache = new QueryCache({
	onError: (err, query) =>
		handleCacheError(err, "query", query.queryKey, query.meta as CacheMeta),
});

const mutationCache = new MutationCache({
	onError: (err, _vars, _ctx, mutation) =>
		handleCacheError(
			err,
			"mutation",
			mutation.options.mutationKey ?? [],
			mutation.options.meta as CacheMeta,
		),
});

const queryClient = new QueryClient({
	queryCache,
	mutationCache,
	defaultOptions: {
		mutations: {
			retry: false,
		},
		queries: {
			retry: (failureCount, error) =>
				isRetryable(toAppError(error)) && failureCount < 2,
			// networkMode intentionally NOT set — defaults to 'online'. FixIt has
			// no offline cache layer. (CONTEXT.md D-NET-02)
			staleTime: 30 * 1000,
			refetchOnMount: true,
			refetchOnReconnect: true,
		},
	},
});

function onAppStateChange(status: AppStateStatus) {
	if (Platform.OS !== "web") {
		focusManager.setFocused(status === "active");
	}
}

const appStateSubscription = AppState.addEventListener(
	"change",
	onAppStateChange,
);

export const __appStateSubscription = appStateSubscription;

onlineManager.setEventListener((setOnline) => {
	Network.getNetworkStateAsync().then((s) =>
		setOnline(!!s.isInternetReachable),
	);
	const sub = Network.addNetworkStateListener((s) => {
		setOnline(!!s.isInternetReachable);
	});
	return () => sub.remove();
});

export default queryClient;
