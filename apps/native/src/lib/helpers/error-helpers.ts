import axios from "axios";

type ApiErrorObject = {
	code?: string;
	hint?: string;
	message?: string;
};

type ApiErrorPayload = {
	error?: string | ApiErrorObject;
	message?: string;
};

function extractApiErrorMessage(payload: ApiErrorPayload | undefined): string | undefined {
	if (!payload) return undefined;

	if (typeof payload.error === "string" && payload.error.trim().length > 0) {
		return payload.error;
	}

	if (payload.error && typeof payload.error === "object") {
		if (
			typeof payload.error.message === "string" &&
			payload.error.message.trim().length > 0
		) {
			return payload.error.message;
		}
		if (
			typeof payload.error.code === "string" &&
			payload.error.code.trim().length > 0
		) {
			return payload.error.code;
		}
		if (
			typeof payload.error.hint === "string" &&
			payload.error.hint.trim().length > 0
		) {
			return payload.error.hint;
		}
	}

	if (typeof payload.message === "string" && payload.message.trim().length > 0) {
		return payload.message;
	}

	return undefined;
}

/**
 * @param error - The error object to extract a message from
 * @returns A string containing the error message
 */
export function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError<ApiErrorPayload>(error)) {
		return (
			extractApiErrorMessage(error.response?.data) ??
			error.message ??
			"Something went wrong. Please try again."
		);
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "Something went wrong. Please try again.";
}
