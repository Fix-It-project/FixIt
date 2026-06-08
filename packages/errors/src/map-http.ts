import { AppError } from "./app-error";

export type HttpErrorLike = {
	response?: { status?: number; data?: unknown };
	request?: unknown;
	message?: string;
	code?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractFields(body: unknown): Record<string, string> | undefined {
	if (!isRecord(body)) return undefined;

	const rawDetails = body.details;
	if (Array.isArray(rawDetails)) {
		const fields: Record<string, string> = {};
		for (const item of rawDetails) {
			if (!isRecord(item)) continue;
			const field = typeof item.field === "string" ? item.field : null;
			const message = typeof item.message === "string" ? item.message : null;
			if (!field || !message) continue;
			fields[field] = message;
		}
		if (Object.keys(fields).length > 0) return fields;
	}

	const raw = body.fields;
	if (!isRecord(raw)) return undefined;
	const fields: Record<string, string> = {};
	for (const [k, v] of Object.entries(raw)) {
		if (typeof v === "string") fields[k] = v;
	}
	return Object.keys(fields).length > 0 ? fields : undefined;
}

function extractUserMessage(body: unknown, fallback: string): string {
	if (isRecord(body)) {
		if (typeof body.userMessage === "string") return body.userMessage;
		if (typeof body.message === "string") return body.message;
		if (typeof body.error === "string") return body.error;
	}
	return fallback;
}

/**
 * Map a raw HTTP status (and optional response body) to an AppError.
 * Locked table (per D-04):
 *   400→VALIDATION, 401→UNAUTHENTICATED, 403→FORBIDDEN, 404→NOT_FOUND,
 *   409→CONFLICT, 422→VALIDATION, 429→RATE_LIMITED, 503→MAINTENANCE,
 *   5xx→SERVER, 0/undefined→NETWORK.
 */
export function mapHttpStatus(
	status: number | undefined,
	body?: unknown,
): AppError {
	const fields = extractFields(body);

	if (status === undefined || status === 0) {
		// Heuristic: if body carries ECONNABORTED-like code, treat as timeout.
		if (isRecord(body) && body.code === "ECONNABORTED") {
			return new AppError(
				"TIMEOUT",
				extractUserMessage(body, "Request timed out. Please try again."),
				{ status },
			);
		}
		return new AppError(
			"NETWORK",
			extractUserMessage(
				body,
				"Network error. Check your connection and try again.",
			),
			{ status },
		);
	}

	const baseOpts = (overrides?: {
		fields?: Record<string, string>;
	}): import("./app-error").AppErrorOpts => {
		const opts: import("./app-error").AppErrorOpts = { status };
		if (overrides?.fields) opts.fields = overrides.fields;
		return opts;
	};

	switch (status) {
		case 400:
		case 422:
			return new AppError(
				"VALIDATION",
				extractUserMessage(body, "Please check the highlighted fields."),
				baseOpts({ fields }),
			);
		case 401:
			return new AppError(
				"UNAUTHENTICATED",
				extractUserMessage(body, "Please sign in to continue."),
				baseOpts(),
			);
		case 403:
			return new AppError(
				"FORBIDDEN",
				extractUserMessage(body, "You don't have access to this."),
				baseOpts(),
			);
		case 404:
			return new AppError(
				"NOT_FOUND",
				extractUserMessage(body, "We couldn't find what you were looking for."),
				baseOpts(),
			);
		case 409:
			return new AppError(
				"CONFLICT",
				extractUserMessage(body, "This action conflicts with the current state."),
				baseOpts(),
			);
		case 429:
			return new AppError(
				"RATE_LIMITED",
				extractUserMessage(body, "Too many requests. Please slow down."),
				baseOpts(),
			);
		case 503:
			return new AppError(
				"MAINTENANCE",
				extractUserMessage(
					body,
					"We're undergoing maintenance. Please try again shortly.",
				),
				baseOpts(),
			);
		default:
			if (status >= 500 && status < 600) {
				return new AppError(
					"SERVER",
					extractUserMessage(
						body,
						"Server error. Please try again in a moment.",
					),
					baseOpts(),
				);
			}
			if (status >= 400 && status < 500) {
				return new AppError(
					"VALIDATION",
					extractUserMessage(body, "Request was rejected."),
					baseOpts({ fields }),
				);
			}
			return new AppError(
				"UNKNOWN",
				extractUserMessage(body, "Something went wrong. Please try again."),
				baseOpts(),
			);
	}
}

/**
 * Map a structural HttpErrorLike (axios-shaped) to an AppError.
 */
export function mapHttpError(err: HttpErrorLike): AppError {
	if (err.response) {
		return mapHttpStatus(err.response.status, err.response.data);
	}
	if (err.code === "ECONNABORTED") {
		return new AppError("TIMEOUT", "Request timed out. Please try again.");
	}
	return new AppError(
		"NETWORK",
		"Network error. Check your connection and try again.",
	);
}
