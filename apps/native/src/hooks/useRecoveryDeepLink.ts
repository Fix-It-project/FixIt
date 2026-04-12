import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { setRecoverySession } from "@/src/lib/auth/recovery-session";

const RESET_PASSWORD_ROUTE = "/(auth)/(forgotpassword)/reset-password" as const;
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

export function useRecoveryDeepLink() {
	const handleRecoveryLink = useCallback((url: string) => {
		if (!url) {
			return;
		}

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
			return;
		}

		const hashIndex = url.indexOf("#");
		if (hashIndex === -1) {
			return;
		}

		const fragment = url.substring(hashIndex + 1);
		const params = new URLSearchParams(fragment);

		const accessToken = params.get("access_token");
		const refreshToken = params.get("refresh_token");
		const type = params.get("type");

		if (type !== "recovery" || !accessToken || !refreshToken) {
			return;
		}

		setRecoverySession({
			accessToken,
			refreshToken,
			userType: "user",
		});

		router.replace(RESET_PASSWORD_ROUTE);
	}, []);

	useEffect(() => {
		Linking.getInitialURL().then((url) => {
			if (url) {
				handleRecoveryLink(url);
			}
		});

		const subscription = Linking.addEventListener("url", ({ url }) => {
			handleRecoveryLink(url);
		});

		return () => subscription.remove();
	}, [handleRecoveryLink]);
}
