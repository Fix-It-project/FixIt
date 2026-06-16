import { create } from "zustand";
import type { AuthUser } from "@/src/features/auth/schemas/response.schema";

export type UserSignupMode = "password" | "oauth";

/**
 * Supabase tokens captured after a successful Google OAuth exchange but held
 * here — NOT persisted to the auth store — until the user finishes the address
 * step. Persisting early would flip `isAuthenticated` and the (auth) layout
 * would redirect the half-onboarded user straight to home.
 */
interface PendingOAuthSession {
	accessToken: string;
	refreshToken: string;
	user: AuthUser;
}

interface UserSignupState {
	mode: UserSignupMode;
	fullName: string;
	email: string;
	phone: string;
	password: string;
	pendingSession: PendingOAuthSession | null;

	setStep1Data: (data: {
		fullName: string;
		email: string;
		phone: string;
		password: string;
	}) => void;
	setPendingOAuth: (data: {
		user: AuthUser;
		accessToken: string;
		refreshToken: string;
		fullName?: string;
	}) => void;
	reset: () => void;
}

const initialState = {
	mode: "password" as UserSignupMode,
	fullName: "",
	email: "",
	phone: "",
	password: "",
	pendingSession: null as PendingOAuthSession | null,
};

export const useUserSignupStore = create<UserSignupState>((set) => ({
	...initialState,
	setStep1Data: (data) => set({ ...data, mode: "password" }),
	setPendingOAuth: ({ user, accessToken, refreshToken, fullName }) =>
		set({
			mode: "oauth",
			pendingSession: { user, accessToken, refreshToken },
			email: user.email,
			fullName: fullName ?? "",
		}),
	reset: () => set(initialState),
}));
