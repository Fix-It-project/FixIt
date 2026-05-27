import type { AppErrorCode } from "./codes";
import { AppError } from "./app-error";

type PostgrestErrorLike = {
	code?: string | null;
	message?: string;
};

const CODE_TABLE: Record<string, AppErrorCode> = {
	PGRST116: "NOT_FOUND",
	"23505": "CONFLICT",
	"23503": "VALIDATION",
	"42501": "FORBIDDEN",
	"57014": "TIMEOUT",
};

const USER_MESSAGES: Record<AppErrorCode, string> = {
	NETWORK: "Network error. Check your connection and try again.",
	TIMEOUT: "Request timed out. Please try again.",
	OFFLINE: "You appear to be offline.",
	UNAUTHENTICATED: "Please sign in to continue.",
	FORBIDDEN: "You don't have access to this.",
	NOT_FOUND: "We couldn't find what you were looking for.",
	CONFLICT: "This action conflicts with the current state.",
	VALIDATION: "Please check the highlighted fields.",
	RATE_LIMITED: "Too many requests. Please slow down.",
	SERVER: "Server error. Please try again in a moment.",
	MAINTENANCE: "We're undergoing maintenance. Please try again shortly.",
	UNKNOWN: "Something went wrong. Please try again.",
};

export function mapPostgrestError(
	err: PostgrestErrorLike | null | undefined,
): AppError {
	const rawCode = err?.code ?? undefined;
	const mapped: AppErrorCode =
		rawCode && CODE_TABLE[rawCode] ? CODE_TABLE[rawCode] : "SERVER";
	const devMessage =
		(err as { message?: string } | undefined)?.message ?? rawCode ?? mapped;
	return new AppError(mapped, USER_MESSAGES[mapped], {
		devMessage,
		cause: err ?? undefined,
	});
}
