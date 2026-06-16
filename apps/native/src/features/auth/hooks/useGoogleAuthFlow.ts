import { router } from "expo-router";
import { useState } from "react";
import { supabase } from "@/src/config/supabase";
import { showError, toAppError } from "@/src/lib/errors";
import { countMetric, METRICS } from "@/src/lib/metrics";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import { oauthStatus } from "../api/auth";
import { useUserSignupStore } from "../stores/user-signup-store";
import { useGoogleOAuth } from "./useGoogleOAuth";

/**
 * Drives the whole Google sign-in flow, shared by the login and signup screens.
 *
 * Critically, for a NEW user we do NOT call `setSession` (which flips
 * `isAuthenticated` and makes the (auth) layout redirect to home). Instead we
 * stash the tokens and route to the address step; `setSession` happens only
 * once the profile is completed. Returning users complete immediately.
 */
export function useGoogleAuthFlow() {
	const { signInWithGoogle } = useGoogleOAuth();
	const setPendingOAuth = useUserSignupStore((s) => s.setPendingOAuth);
	const setSession = useAuthStore((s) => s.setSession);
	const [isPending, setIsPending] = useState(false);

	const startGoogleSignIn = async () => {
		if (isPending) return;
		setIsPending(true);
		try {
			const result = await signInWithGoogle();
			if (result.type === "cancel") return;
			if (result.type === "error") {
				countMetric(METRICS.oauthLogin, 1, { attributes: { result: "error" } });
				showError(result.error);
				return;
			}

			const { session } = result;
			const user = { id: session.user.id, email: session.user.email ?? "" };

			// Bearer is auto-attached from the in-memory supabase session.
			const status = await oauthStatus();

			if (status.needsProfile) {
				const metadata = session.user.user_metadata as
					| { full_name?: string; name?: string }
					| undefined;
				setPendingOAuth({
					user,
					accessToken: session.access_token,
					refreshToken: session.refresh_token,
					fullName: metadata?.full_name ?? metadata?.name,
				});
				countMetric(METRICS.oauthLogin, 1, {
					attributes: { result: "needs_profile" },
				});
				router.push(ROUTES.auth.signupStep2);
				return;
			}

			// Returning user — persist + let the auth gate route home.
			await setSession(
				user,
				session.access_token,
				session.refresh_token,
				"user",
			);
			countMetric(METRICS.oauthLogin, 1, {
				attributes: { result: "success" },
			});
			router.replace(ROUTES.user.home);
		} catch (err) {
			// e.g. `not_user_account` (the email belongs to a technician). Drop the
			// dangling in-memory supabase session so a retry starts clean.
			await supabase.auth.signOut().catch(() => undefined);
			countMetric(METRICS.oauthLogin, 1, { attributes: { result: "error" } });
			showError(toAppError(err));
		} finally {
			setIsPending(false);
		}
	};

	return { startGoogleSignIn, isPending };
}
