import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AdminUser {
	id: string;
	email: string;
	role?: "admin" | "superadmin";
	[k: string]: unknown;
}

const STORAGE_KEY = "fixit_admin_auth";

interface AuthState {
	user: AdminUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setSession: (user: AdminUser) => void;
	clearSession: () => void;
	setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			isLoading: false,
			setSession: (user) =>
				set({
					user,
					isAuthenticated: true,
					isLoading: false,
				}),
			clearSession: () =>
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				}),
			setLoading: (loading) => set({ isLoading: loading }),
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			// Persist only the cached user for instant topbar render. `isAuthenticated`
			// is NOT persisted: route access is gated on a verified `/me` in beforeLoad,
			// so a stale flag can never pre-admit a session.
			partialize: (state) => ({
				user: state.user,
			}),
		},
	),
);
