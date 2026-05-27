import axios from "axios";
import { getErrorMessage as getAppErrorMessage } from "@/src/lib/errors/to-app-error";

type LegacyErrorPayload = {
	error?: string | { code?: unknown; message?: unknown };
	message?: unknown;
};

function getLegacyPayloadMessage(payload: LegacyErrorPayload): string | null {
	if (typeof payload.error === "string") return payload.error;
	if (payload.error && typeof payload.error === "object") {
		if (typeof payload.error.message === "string") return payload.error.message;
		if (typeof payload.error.code === "string") return payload.error.code;
	}
	if (typeof payload.message === "string") return payload.message;
	return null;
}

export function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const payload = error.response?.data;
		if (payload && typeof payload === "object") {
			const message = getLegacyPayloadMessage(payload as LegacyErrorPayload);
			if (message) return message;
		}
	}

	return getAppErrorMessage(error);
}
