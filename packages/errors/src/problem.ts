import { type AppErrorCode, statusFromCode } from "./codes";
import { AppError } from "./app-error";

export interface ProblemDetails {
	type: string;
	title: string;
	status: number;
	detail?: string;
	instance?: string;
	code: AppErrorCode;
	userMessage: string;
	token?: string;
	fields?: Record<string, string>;
	traceId?: string;
}

const KNOWN_CODES: ReadonlySet<string> = new Set<AppErrorCode>([
	"NETWORK",
	"TIMEOUT",
	"OFFLINE",
	"UNAUTHENTICATED",
	"FORBIDDEN",
	"NOT_FOUND",
	"CONFLICT",
	"VALIDATION",
	"RATE_LIMITED",
	"SERVER",
	"MAINTENANCE",
	"UNKNOWN",
]);

const TITLES: Record<AppErrorCode, string> = {
	NETWORK: "Network error",
	TIMEOUT: "Request timed out",
	OFFLINE: "Offline",
	UNAUTHENTICATED: "Not signed in",
	FORBIDDEN: "Forbidden",
	NOT_FOUND: "Not found",
	CONFLICT: "Conflict",
	VALIDATION: "Validation failed",
	RATE_LIMITED: "Too many requests",
	SERVER: "Server error",
	MAINTENANCE: "Service unavailable",
	UNKNOWN: "Something went wrong",
};

const GENERIC_USER_MESSAGE = "Something went wrong. Please try again.";

function asAppErrorCode(value: unknown): AppErrorCode {
	if (typeof value === "string" && KNOWN_CODES.has(value)) {
		return value as AppErrorCode;
	}
	return "UNKNOWN";
}

export function toProblemDetails(
	err: AppError,
	req?: { url?: string },
): ProblemDetails {
	const status = err.opts.status ?? statusFromCode(err.code);
	const problem: ProblemDetails = {
		type: `https://fixit.app/errors/${err.code.toLowerCase()}`,
		title: TITLES[err.code],
		status,
		code: err.code,
		userMessage: err.userMessage,
	};
	if (err.opts.devMessage) problem.detail = err.opts.devMessage;
	if (req?.url) problem.instance = req.url;
	if (err.opts.token) problem.token = err.opts.token;
	if (err.opts.fields) problem.fields = err.opts.fields;
	return problem;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function fromProblemDetails(json: unknown): AppError {
	if (!isRecord(json)) {
		return new AppError("UNKNOWN", GENERIC_USER_MESSAGE);
	}

	// RFC 9457 shape: BOTH `code` and `userMessage` keys present.
	if ("code" in json && "userMessage" in json) {
		const code = asAppErrorCode(json.code);
		const userMessage =
			typeof json.userMessage === "string"
				? json.userMessage
				: GENERIC_USER_MESSAGE;
		const opts: import("./app-error").AppErrorOpts = {};
		if (typeof json.status === "number") opts.status = json.status;
		if (typeof json.detail === "string") opts.devMessage = json.detail;
		if (typeof json.token === "string") opts.token = json.token;
		if (isRecord(json.fields)) {
			const fields: Record<string, string> = {};
			for (const [k, v] of Object.entries(json.fields)) {
				if (typeof v === "string") fields[k] = v;
			}
			opts.fields = fields;
		}
		return new AppError(code, userMessage, opts);
	}

	// Legacy shape: `{ error: ... }`.
	if ("error" in json) {
		const errorField = json.error;
		if (typeof errorField === "string") {
			return new AppError("UNKNOWN", errorField);
		}
		if (isRecord(errorField)) {
			const code = asAppErrorCode(errorField.code);
			const userMessage =
				typeof errorField.message === "string"
					? errorField.message
					: GENERIC_USER_MESSAGE;
			const opts: import("./app-error").AppErrorOpts = {};
			if (typeof errorField.hint === "string") opts.devMessage = errorField.hint;
			return new AppError(code, userMessage, opts);
		}
	}

	return new AppError("UNKNOWN", GENERIC_USER_MESSAGE);
}
