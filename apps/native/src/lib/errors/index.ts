import {
	AppError,
	fromProblemDetails,
	mapHttpStatus,
	mapPostgrestError,
	mapZodError,
} from "@FixIt/errors";
import axios, { type AxiosError } from "axios";
import Toast from "react-native-toast-message";

const GENERIC_USER_MESSAGE = "Something went wrong. Please try again.";

function looksLikePostgrest(value: unknown): boolean {
	if (!value || typeof value !== "object") return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.code === "string" &&
		typeof v.message === "string" &&
		"hint" in v &&
		!("isAxiosError" in v) &&
		!("response" in v) &&
		!("request" in v)
	);
}

function looksLikeZod(value: unknown): boolean {
	if (!value || typeof value !== "object") return false;
	const v = value as Record<string, unknown>;
	return v.name === "ZodError" && Array.isArray(v.issues);
}

function axiosToAppError(err: AxiosError): AppError {
	if (err.response) {
		const status = err.response.status;
		const data = err.response.data;

		if (data && typeof data === "object") {
			const candidate = fromProblemDetails(data);
			if (candidate.code !== "UNKNOWN") {
				return new AppError(candidate.code, candidate.userMessage, {
					...candidate.opts,
					status,
					cause: err,
				});
			}
		}

		const mapped = mapHttpStatus(status, data);
		return new AppError(mapped.code, mapped.userMessage, {
			...mapped.opts,
			status,
			cause: err,
		});
	}

	if (err.code === "ECONNABORTED") {
		return new AppError("TIMEOUT", "Request timed out.", { cause: err });
	}

	if (err.request) {
		return new AppError("NETWORK", "Network unavailable.", { cause: err });
	}

	return new AppError("UNKNOWN", GENERIC_USER_MESSAGE, {
		devMessage: err.message,
		cause: err,
	});
}

export function toAppError(err: unknown): AppError {
	if (err instanceof AppError) return err;

	if (axios.isAxiosError(err)) return axiosToAppError(err);

	if (looksLikePostgrest(err)) {
		return mapPostgrestError(err as Parameters<typeof mapPostgrestError>[0]);
	}

	if (looksLikeZod(err)) {
		return mapZodError(err as Parameters<typeof mapZodError>[0]);
	}

	if (err instanceof Error) {
		return new AppError("UNKNOWN", GENERIC_USER_MESSAGE, {
			devMessage: err.message,
			cause: err,
		});
	}

	if (err === undefined || err === null) {
		return new AppError("UNKNOWN", GENERIC_USER_MESSAGE);
	}

	return new AppError("UNKNOWN", GENERIC_USER_MESSAGE, {
		devMessage: String(err),
	});
}

export function getErrorMessage(err: unknown): string {
	return toAppError(err).userMessage;
}

// Single allowed Toast.show({ type: "error" }) site. Biome rule LGUARD-02 enforces this.
export function showError(err: AppError | unknown): void {
	const app = err instanceof AppError ? err : toAppError(err);
	switch (app.code) {
		case "UNAUTHENTICATED":
			// auth-interceptor owns refresh + redirect
			return;
		case "VALIDATION":
			// form owns inline field errors
			return;
		case "FORBIDDEN":
			// screen owns the forbidden state
			return;
		case "NOT_FOUND":
			// screen owns the not-found state
			return;
		case "NETWORK":
		case "OFFLINE":
		case "TIMEOUT":
			// screen owns the query-error retry affordance
			return;
		case "CONFLICT":
		case "RATE_LIMITED":
			Toast.show({
				type: "error",
				text1: app.userMessage,
				text2: "Try again.",
			});
			return;
		default:
			Toast.show({
				type: "error",
				text1: app.userMessage,
			});
			return;
	}
}
