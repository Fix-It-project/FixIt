import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AdminUser {
	id: string;
	email: string;
	// NOTE: server-side admin role middleware is a prerequisite.
	// Shape will firm up once /api/admin/* endpoints land — see plan doc.
	role?: "admin" | "superadmin";
	[k: string]: unknown;
}

const STORAGE_KEY = "fixit_admin_auth";

interface AuthState {
	user: AdminUser | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setSession: (
		user: AdminUser,
		accessToken: string,
		refreshToken: string,
	) => void;
	clearSession: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			isLoading: false,
			setSession: (user, accessToken, refreshToken) =>
				set({
					user,
					accessToken,
					refreshToken,
					isAuthenticated: true,
					isLoading: false,
				}),
			clearSession: () =>
				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
					isLoading: false,
				}),
			setLoading: (loading) => set({ isLoading: loading }),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);
