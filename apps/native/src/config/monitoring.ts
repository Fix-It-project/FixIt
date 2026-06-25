import { env } from "@FixIt/env/native";
import * as Sentry from "@sentry/react-native";
import { isRunningInExpoGo } from "expo";
import Constants from "expo-constants";
import type { useNavigationContainerRef } from "expo-router";
import { __setBreadcrumbSink, __setCaptureSink } from "@/src/lib/logger";

const navigationIntegration = Sentry.reactNavigationIntegration({
	enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

const tracingTargets: (string | RegExp)[] = [
	/^https?:\/\/([a-z0-9-]+\.)*fixit\.app\//,
];
if (env.EXPO_PUBLIC_SERVER_URL) {
	tracingTargets.push(env.EXPO_PUBLIC_SERVER_URL);
}

const FALLBACK_DSN =
	"https://bd466622828fff10dd93d712742852e5@o4510789900500992.ingest.us.sentry.io/4510789900763136";

const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN =
	/(authorization|token|password|secret|session|cookie|email|phone|address|national|criminal|certificate|base64|uri)/i;

function scrubSensitive(
	value: unknown,
	depth = 0,
	seen = new WeakSet<object>(),
): unknown {
	if (depth > 8) return "[MaxDepth]";
	if (value === null || value === undefined) return value;
	if (typeof value === "string") {
		if (/^Bearer\s+/i.test(value)) return REDACTED;
		if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
			return REDACTED;
		}
		return value;
	}
	if (typeof value !== "object") return value;
	if (seen.has(value)) return "[Circular]";
	seen.add(value);
	if (Array.isArray(value)) {
		return value.map((item) => scrubSensitive(item, depth + 1, seen));
	}

	const out: Record<string, unknown> = {};
	for (const [key, nested] of Object.entries(
		value as Record<string, unknown>,
	)) {
		out[key] = SENSITIVE_KEY_PATTERN.test(key)
			? REDACTED
			: scrubSensitive(nested, depth + 1, seen);
	}
	return out;
}

function matchesTracingTarget(url: string): boolean {
	return tracingTargets.some((target) =>
		typeof target === "string" ? url.startsWith(target) : target.test(url),
	);
}

Sentry.init({
	dsn: env.EXPO_PUBLIC_SENTRY_DSN ?? FALLBACK_DSN,
	sendDefaultPii: false,
	enableAutoSessionTracking: true,
	enableNative: true,
	enableNativeCrashHandling: true,
	enableNativeFramesTracking: !isRunningInExpoGo(),
	enableLogs: true,
	spotlight: __DEV__,
	tracesSampleRate: __DEV__ ? 1 : 0.2,
	tracePropagationTargets: tracingTargets,
	profilesSampleRate: 1,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	// PRIV-03 (Phase 12): enabled now that plan 12-02 scrubbed auth-store + ~32 console.* sites.
	// DO NOT flip these on without first verifying that no log site emits accessToken/
	// refreshToken/full-user/full-session.
	attachScreenshot: true,
	attachViewHierarchy: true,
	ignoreErrors: ["Network request failed", "AbortError", "Aborted"],
	release: Constants.expoConfig?.version ?? undefined,
	dist: Constants.expoConfig?.runtimeVersion
		? String(Constants.expoConfig.runtimeVersion)
		: undefined,
	// LOG-03 (Phase 12, plan 12-03): drop the default Console breadcrumb integration —
	// our `logger.error` calls flow into `Sentry.addBreadcrumb` directly (sink wired below).
	// Without this filter, every error logs as two breadcrumbs AND the default Console
	// capture would re-introduce PII via `console.*` calls in third-party libs.
	integrations: (defaults) => [
		...defaults.filter((i) => i.name !== "Console"),
		navigationIntegration,
		Sentry.reactNativeTracingIntegration({
			shouldCreateSpanForRequest: matchesTracingTarget,
		}),
		Sentry.mobileReplayIntegration({
			maskAllText: true,
			maskAllImages: true,
		}),
	],
	beforeSend(event) {
		if (event.user) {
			delete event.user.email;
			delete event.user.ip_address;
		}
		if (event.contexts && "token" in event.contexts) {
			delete (event.contexts as Record<string, unknown>).token;
		}
		if (event.request?.headers) {
			delete event.request.headers.Authorization;
			delete event.request.headers.authorization;
		}
		return scrubSensitive(event) as typeof event;
	},
	beforeBreadcrumb(crumb) {
		if (crumb.level === "debug" && crumb.category === "console") {
			return null;
		}
		return scrubSensitive(crumb) as typeof crumb;
	},
});

__setBreadcrumbSink((b) => {
	Sentry.addBreadcrumb({
		category: b.category,
		message: b.message,
		level: b.level === "warn" ? "warning" : b.level,
		data: b.data
			? (scrubSensitive(b.data) as Record<string, unknown>)
			: undefined,
		timestamp: b.timestamp,
	});
});

__setCaptureSink((err, ctx) => {
	Sentry.captureException(err, {
		contexts: ctx
			? { logger: scrubSensitive(ctx) as Record<string, unknown> }
			: undefined,
	});
});

export function setUser(u: { id: string; role: "user" | "technician" }): void {
	Sentry.setUser({ id: u.id, role: u.role });
}

export function clearUser(): void {
	Sentry.setUser(null);
}

export function setFeatureContext(
	name: string,
	ctx: Record<string, unknown>,
): void {
	Sentry.setContext(name, ctx);
}

export function registerNavigationContainer(
	ref: ReturnType<typeof useNavigationContainerRef>,
): void {
	navigationIntegration.registerNavigationContainer(ref);
}

export { Sentry };
