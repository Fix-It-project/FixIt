import {
	GoogleSignin,
	isErrorWithCode,
	isSuccessResponse,
	statusCodes,
} from "@react-native-google-signin/google-signin";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/src/config/supabase";
import { toAppError } from "@/src/lib/errors";

export type GoogleOAuthResult =
	| { type: "success"; session: Session }
	| { type: "cancel" }
	| { type: "error"; error: ReturnType<typeof toAppError> };

export function useGoogleOAuth() {
	const signInWithGoogle = async (): Promise<GoogleOAuthResult> => {
		try {
			await GoogleSignin.hasPlayServices({
				showPlayServicesUpdateDialog: true,
			});
			await GoogleSignin.signOut();

			const response = await GoogleSignin.signIn();
			if (!isSuccessResponse(response)) {
				return { type: "cancel" };
			}

			const idToken = response.data.idToken;
			if (!idToken) {
				return {
					type: "error",
					error: toAppError(new Error("oauth_no_id_token")),
				};
			}

			const { data, error } = await supabase.auth.signInWithIdToken({
				provider: "google",
				token: idToken,
			});
			if (error || !data.session) {
				return {
					type: "error",
					error: toAppError(error ?? new Error("oauth_exchange_failed")),
				};
			}

			return { type: "success", session: data.session };
		} catch (err) {
			if (isErrorWithCode(err) && err.code === statusCodes.SIGN_IN_CANCELLED) {
				return { type: "cancel" };
			}
			return { type: "error", error: toAppError(err) };
		}
	};

	return { signInWithGoogle };
}
