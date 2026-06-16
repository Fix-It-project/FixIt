import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "@/src/config/supabase";
import { toAppError } from "@/src/lib/errors";

WebBrowser.maybeCompleteAuthSession();

export type GoogleOAuthResult =
	| { type: "success"; session: Session }
	| { type: "cancel" }
	| { type: "error"; error: ReturnType<typeof toAppError> };

/**
 * Runs Google sign-in entirely inside the app (ASWebAuthenticationSession /
 * Chrome Custom Tab) and finishes the PKCE handshake. The previous version
 * opened the browser but ignored its result, so no code was ever exchanged and
 * no session was created — that was the bug.
 */
export function useGoogleOAuth() {
	const signInWithGoogle = async (): Promise<GoogleOAuthResult> => {
		try {
			const redirectUrl = Linking.createURL("/");

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
			});
			if (error || !data.url) {
				return {
					type: "error",
					error: toAppError(error ?? new Error("oauth_init_failed")),
				};
			}

			const result = await WebBrowser.openAuthSessionAsync(
				data.url,
				redirectUrl,
			);
			if (result.type !== "success") {
				return { type: "cancel" };
			}

			// PKCE: the redirect carries `?code=...`; exchange it for a session.
			const { queryParams } = Linking.parse(result.url);
			const code =
				typeof queryParams?.code === "string" ? queryParams.code : null;
			if (!code) {
				return { type: "error", error: toAppError(new Error("oauth_no_code")) };
			}

			const { data: sessionData, error: exchangeError } =
				await supabase.auth.exchangeCodeForSession(code);
			if (exchangeError || !sessionData.session) {
				return {
					type: "error",
					error: toAppError(exchangeError ?? new Error("oauth_exchange_failed")),
				};
			}

			return { type: "success", session: sessionData.session };
		} catch (err) {
			return { type: "error", error: toAppError(err) };
		}
	};

	return { signInWithGoogle };
}
