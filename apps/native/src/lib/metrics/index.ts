/**
 * Thin, typed wrapper around Sentry metrics so feature code never touches the
 * SDK directly. Importing from `@/src/config/monitoring` guarantees `Sentry.init`
 * has run. Every call is best-effort and guarded — metrics must never throw into
 * product code, and they no-op gracefully if the installed SDK lacks the API.
 *
 * Usage:
 *   countMetric(METRICS.orderBooked);
 *   countMetric(METRICS.techRequestAction, 1, { attributes: { action: "accept" } });
 *   distributionMetric("response_time", 187.5, { unit: "millisecond" });
 */
import { Sentry } from "@/src/config/monitoring";

export type MetricUnit =
	| "none"
	| "millisecond"
	| "second"
	| "byte"
	| "request"
	| "percent";

export interface MetricOptions {
	unit?: MetricUnit;
	attributes?: Record<string, string | number | boolean>;
}

/** Stable metric names — avoid magic strings at call sites. */
export const METRICS = {
	appLaunch: "app_launch",
	loginSuccess: "login_success",
	loginFailure: "login_failure",
	oauthLogin: "oauth_login",
	orderBooked: "order_booked",
	techRequestAction: "tech_request_action",
} as const;

interface SentryMetricsApi {
	count: (name: string, value?: number, opts?: MetricOptions) => void;
	gauge: (name: string, value: number, opts?: MetricOptions) => void;
	distribution: (name: string, value: number, opts?: MetricOptions) => void;
}

function metricsApi(): SentryMetricsApi | undefined {
	return (Sentry as unknown as { metrics?: SentryMetricsApi }).metrics;
}

export function countMetric(
	name: string,
	value = 1,
	opts?: MetricOptions,
): void {
	try {
		metricsApi()?.count(name, value, opts);
	} catch {
		// metrics are best-effort; never surface into product code
	}
}

export function gaugeMetric(
	name: string,
	value: number,
	opts?: MetricOptions,
): void {
	try {
		metricsApi()?.gauge(name, value, opts);
	} catch {
		// best-effort
	}
}

export function distributionMetric(
	name: string,
	value: number,
	opts?: MetricOptions,
): void {
	try {
		metricsApi()?.distribution(name, value, opts);
	} catch {
		// best-effort
	}
}
