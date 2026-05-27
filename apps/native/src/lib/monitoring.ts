import { env } from "@FixIt/env/native";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { isRunningInExpoGo } from "expo";
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

Sentry.init({
  dsn: env.EXPO_PUBLIC_SENTRY_DSN ?? FALLBACK_DSN,
  sendDefaultPii: false,
  enableAutoSessionTracking: true,
  enableNative: true,
  enableNativeCrashHandling: true,
  enableNativeFramesTracking: !isRunningInExpoGo(),
  enableLogs: true,
  spotlight: __DEV__,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
  profilesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
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
      tracePropagationTargets: tracingTargets,
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
    return event;
  },
  beforeBreadcrumb(crumb) {
    if (crumb.level === "debug" && crumb.category === "console") {
      return null;
    }
    return crumb;
  },
});

__setBreadcrumbSink((b) => {
  Sentry.addBreadcrumb({
    category: b.category,
    message: b.message,
    level: b.level,
    data: b.data,
    timestamp: b.timestamp,
  });
});

__setCaptureSink((err, ctx) => {
  Sentry.captureException(err, {
    contexts: ctx ? { logger: ctx as Record<string, unknown> } : undefined,
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
