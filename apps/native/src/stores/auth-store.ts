import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { AuthUser } from "@/src/services/auth/schemas/response.schema";

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

  setSession: (user: AuthUser, accessToken: string, refreshToken: string, userType?: UserType) => Promise<void>;
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
    console.log("[AuthStore] setSession called:", { user, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken, userType });

    try {
      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
        SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user)),
        SecureStore.setItemAsync(STORAGE_KEYS.USER_TYPE, userType),
      ]);

      set({
        user,
        accessToken,
        refreshToken,
        userType,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log("[AuthStore] State after setSession:", { isAuthenticated: true, user, userType });
    } catch (error) {
      console.error("[AuthStore] Failed to persist session:", error);
      throw error;
    }
  },

  // ── Clear Session (logout / auth failure) ────────────────────────────────

  clearSession: async () => {
    console.log("[AuthStore] clearSession called");

    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_TYPE),
      ]);
    } catch (error) {
      console.error("[AuthStore] Failed to clear storage:", error);
    }

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      userType: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  // ── Load Stored Session (app startup) ────────────────────────────────────
  loadStoredSession: async () => {
    try {
      console.log("[AuthStore] loadStoredSession: reading SecureStore...");
      set({ isLoading: true });

      const [accessToken, refreshToken, userJson, storedUserType] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER),
        SecureStore.getItemAsync(STORAGE_KEYS.USER_TYPE),
      ]);

      console.log("[AuthStore] SecureStore values:", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasUser: !!userJson,
      });

      if (!accessToken || !refreshToken || !userJson) {
        console.log("[AuthStore] No stored session found");
        set({ isLoading: false });
        return;
      }

      const parsed = JSON.parse(userJson);
      if (!parsed || typeof parsed.id !== 'string') {
        console.log("[AuthStore] Invalid stored user data");
        await get().clearSession();
        return;
      }
      const user = parsed as AuthUser;
      const userType: UserType = storedUserType === 'technician' ? 'technician' : 'user';
      console.log("[AuthStore] Restored session for user:", user, "type:", userType);
      set({
        user,
        accessToken,
        refreshToken,
        userType,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      console.log("[AuthStore] loadStoredSession error:", err);
      await get().clearSession();
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
