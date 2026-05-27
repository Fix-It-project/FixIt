/**
 * AppErrorCode — locked taxonomy. Adding or renaming any code requires
 * revisiting the routing table in CONTEXT.md and updating every consumer.
 */
export type AppErrorCode =
	| "NETWORK"
	| "TIMEOUT"
	| "OFFLINE"
	| "UNAUTHENTICATED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "VALIDATION"
	| "RATE_LIMITED"
	| "SERVER"
	| "MAINTENANCE"
	| "UNKNOWN";

/**
 * Reverse mapping: AppErrorCode → HTTP status the server will emit.
 * Used by `toProblemDetails` when the original axios `status` is absent.
 * Locked per CONTEXT.md (Implementation Decisions → statusFromCode).
 */
export function statusFromCode(code: AppErrorCode): number {
	switch (code) {
		case "UNAUTHENTICATED":
			return 401;
		case "FORBIDDEN":
			return 403;
		case "NOT_FOUND":
			return 404;
		case "CONFLICT":
			return 409;
		case "VALIDATION":
			return 422;
		case "RATE_LIMITED":
			return 429;
		case "MAINTENANCE":
			return 503;
		case "SERVER":
			return 500;
		// NETWORK | TIMEOUT | OFFLINE | UNKNOWN — no canonical HTTP status; default 500.
		default:
			return 500;
	}
}
