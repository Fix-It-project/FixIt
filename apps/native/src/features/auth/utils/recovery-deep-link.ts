import * as Linking from "expo-linking";
import {
	type RecoverySession,
	setRecoverySession,
} from "@/src/features/auth/utils/recovery-session";

const RECOVERY_DEEP_LINK_SCHEME = "fixitapp";
const RECOVERY_DEEP_LINK_PATH = "reset-password";

function trimSlashes(value: string) {
	let start = 0;
	let end = value.length;

	while (start < end && value[start] === "/") {
		start += 1;
	}

	while (end > start && value[end - 1] === "/") {
		end -= 1;
	}

	return value.slice(start, end);
}

export function parseRecoveryDeepLink(url: string): RecoverySession | null {
	const parsedUrl = Linking.parse(url);
	const normalizedPath = [parsedUrl.hostname, parsedUrl.path]
		.filter(Boolean)
		.join("/")
		.trim();
	const trimmedPath = trimSlashes(normalizedPath);

	if (
		parsedUrl.scheme !== RECOVERY_DEEP_LINK_SCHEME ||
		trimmedPath !== RECOVERY_DEEP_LINK_PATH
	) {
		return null;
	}

	const hashIndex = url.indexOf("#");
	if (hashIndex === -1) {
		return null;
	}

	const params = new URLSearchParams(url.substring(hashIndex + 1));
	const accessToken = params.get("access_token");
	const refreshToken = params.get("refresh_token");
	const type = params.get("type");

	if (type !== "recovery" || !accessToken || !refreshToken) {
		return null;
	}

	return {
		accessToken,
		refreshToken,
		userType: "user",
	};
}

export function consumeRecoveryDeepLink(
	url: string | null | undefined,
): RecoverySession | null {
	if (!url) {
		return null;
	}

	const session = parseRecoveryDeepLink(url);
	if (session) {
		setRecoverySession(session);
	}

	return session;
}
