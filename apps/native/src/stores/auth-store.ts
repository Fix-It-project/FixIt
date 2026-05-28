import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import type { AuthUser } from "@/src/features/auth/schemas/response.schema";
import { logger } from "@/src/lib/logger";
import * as monitoring from "@/src/config/monitoring";
import { supabase } from "@/src/config/supabase";

// ─── Secure Storage Keys ─────────────────────────────────────────────────────

const STORAGE_KEYS = {
	ACCESS_TOKEN: "fixit_access_token",
	REFRESH_TOKEN: "fixit_refresh_token",
	USER: "fixit_user",
	USER_TYPE: "fixit_user_type",
} as const;

export type UserType = "user" | "technician";

// ─── Store Types ─────────────────────────────────────────────────────────────

interface AuthState {
	// State
	user: AuthUser | null;
	accessToken: string | null;
	refreshToken: string | null;
	userType: UserType | null;
	isAuthenticated: boolean;
	isLoading: boolean;

	setSession: (
		user: AuthUser,
		accessToken: string,
		refreshToken: string,
		userType?: UserType,
	) => Promise<void>;
	clearSession: () => Promise<void>;
	loadStoredSession: () => Promise<void>;
	setLoading: (loading: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	accessToken: null,
	refreshToken: null,
	userType: null,
	isAuthenticated: false,
	isLoading: true,
	setSession: async (user, accessToken, refreshToken, userType = "user") => {
		logger.debug("AuthStore", "setSession", {
			userId: user.id,
			role: userType,
			hasAccessToken: !!accessToken,
			hasRefreshToken: !!refreshToken,
		});

		try {
			await Promise.all([
				SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
				SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
				SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user)),
				SecureStore.setItemAsync(STORAGE_KEYS.USER_TYPE, userType),
			]);

			await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken,
			});
			supabase.realtime.setAuth(accessToken);

			set({
				user,
				accessToken,
				refreshToken,
				userType,
				isAuthenticated: true,
				isLoading: false,
			});

			logger.debug("AuthStore", "session set", {
				userId: user.id,
				role: userType,
			});

			monitoring.setUser({ id: user.id, role: userType });
		} catch (error) {
			logger.error("AuthStore", "Failed to persist session", error);
			throw error;
		}
	},

	// ── Clear Session (logout / auth failure) ────────────────────────────────

	clearSession: async () => {
		logger.debug("AuthStore", "clearSession");

		try {
			await supabase.auth.signOut();
		} catch (signOutErr) {
			logger.error(
				"AuthStore",
				"supabase.auth.signOut failed (continuing logout)",
				signOutErr,
			);
		}

		try {
			await Promise.all([
				SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
				SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
				SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
				SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TYPE),
			]);
		} catch (error) {
			logger.error("AuthStore", "Failed to clear storage", error);
		}

		set({
			user: null,
			accessToken: null,
			refreshToken: null,
			userType: null,
			isAuthenticated: false,
			isLoading: false,
		});

		monitoring.clearUser();
	},

	// ── Load Stored Session (app startup) ────────────────────────────────────
	loadStoredSession: async () => {
		try {
			logger.debug("AuthStore", "loadStoredSession reading SecureStore");
			set({ isLoading: true });

			const [accessToken, refreshToken, userJson, storedUserType] =
				await Promise.all([
					SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
					SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
					SecureStore.getItemAsync(STORAGE_KEYS.USER),
					SecureStore.getItemAsync(STORAGE_KEYS.USER_TYPE),
				]);

			logger.debug("AuthStore", "SecureStore values", {
				hasAccessToken: !!accessToken,
				hasRefreshToken: !!refreshToken,
				hasUser: !!userJson,
			});

			if (!accessToken || !refreshToken || !userJson) {
				logger.debug("AuthStore", "No stored session found");
				set({ isLoading: false });
				return;
			}

			const parsed = JSON.parse(userJson);
			if (!parsed || typeof parsed.id !== "string") {
				logger.warn("AuthStore", "Invalid stored user data");
				await get().clearSession();
				return;
			}
			const user = parsed as AuthUser;
			const userType: UserType =
				storedUserType === "technician" ? "technician" : "user";
			logger.debug("AuthStore", "loadStoredSession restored", {
				userId: user.id,
				role: userType,
			});

			await supabase.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken,
			});

			// If the stored access token is expired, refresh it before any
			// realtime channel attempts to subscribe — otherwise the WebSocket
			// auth fails with "InvalidJWTToken: Token has expired" and the
			// channel stays in CHANNEL_ERROR until the next API call triggers
			// a refresh. (Realtime subscribes on mount, before any API call.)
			let effectiveAccessToken = accessToken;
			let effectiveRefreshToken = refreshToken;
			try {
				const { data: refreshed, error: refreshErr } =
					await supabase.auth.refreshSession();
				if (refreshErr) {
					logger.warn("AuthStore", "refreshSession on rehydrate failed", {
						error: refreshErr.message,
					});
				} else if (refreshed.session) {
					effectiveAccessToken = refreshed.session.access_token;
					effectiveRefreshToken = refreshed.session.refresh_token;
					await Promise.all([
						SecureStore.setItemAsync(
							STORAGE_KEYS.ACCESS_TOKEN,
							effectiveAccessToken,
						),
						SecureStore.setItemAsync(
							STORAGE_KEYS.REFRESH_TOKEN,
							effectiveRefreshToken,
						),
					]);
					logger.debug("AuthStore", "rehydrated session refreshed");
				}
			} catch (refreshThrown) {
				logger.warn("AuthStore", "refreshSession on rehydrate threw", {
					error:
						refreshThrown instanceof Error
							? refreshThrown.message
							: String(refreshThrown),
				});
			}

			supabase.realtime.setAuth(effectiveAccessToken);
			logger.debug("AuthStore", "supabase.auth.setSession rehydrated");

			set({
				user,
				accessToken: effectiveAccessToken,
				refreshToken: effectiveRefreshToken,
				userType,
				isAuthenticated: true,
				isLoading: false,
			});
		} catch (err) {
			logger.error("AuthStore", "loadStoredSession error", err);
			await get().clearSession();
		}
	},

	setLoading: (loading) => set({ isLoading: loading }),
}));
