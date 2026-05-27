import { AppError } from "../../shared/errors/app-error.js";
import {
	addressesRepository,
	type SignUpAddressData,
} from "../addresses/index.js";
import { usersRepository } from "../users/index.js";
import {
	authRepository,
	type SignInData,
	type SignUpData,
} from "./auth.repository.js";

export class AuthService {
	async signUp(data: SignUpData, addressData: SignUpAddressData) {
		const result = await authRepository.signUp(data);

		// Store user in database
		if (result.user) {
			await usersRepository.createUser({
				id: result.user.id,
				email: data.email,
				fullName: data.fullName,
				phone: data.phone,
			});

			await addressesRepository.createAddress({
				user_id: result.user.id,
				city: addressData.city,
				street: addressData.street,
				building_no: addressData.building_no,
				apartment_no: addressData.apartment_no,
				latitude: addressData.latitude ?? null,
				longitude: addressData.longitude ?? null,
				is_active: true,
			});
		}

		return {
			user: {
				id: result.user?.id,
				email: result.user?.email,
			},
			message: "User registered successfully. Please sign in to continue.",
		};
	}

	async signIn(data: SignInData) {
		const result = await authRepository.signIn(data);

		// Guard: reject if this email belongs to a technician, not a user
		const userRecord = await usersRepository.getUserByEmail(data.email);
		if (!userRecord) {
			await Promise.resolve(
				authRepository.signOut(result.session?.access_token ?? ""),
			).catch(() => undefined);
			throw AppError.forbidden("No user account found for this email", {
				token: "not_user_account",
			});
		}

		return {
			user: {
				id: result.user?.id,
				email: result.user?.email,
			},
			session: {
				accessToken: result.session?.access_token,
				refreshToken: result.session?.refresh_token,
				expiresAt: result.session?.expires_at,
			},
		};
	}

	async signOut(accessToken: string) {
		return await authRepository.signOut(accessToken);
	}

	async getCurrentUser(accessToken: string) {
		return await authRepository.getUser(accessToken);
	}

	async refreshSession(refreshToken: string) {
		const result = await authRepository.refreshToken(refreshToken);

		return {
			user: result.user,
			session: {
				accessToken: result.session?.access_token,
				refreshToken: result.session?.refresh_token,
				expiresAt: result.session?.expires_at,
			},
		};
	}

	async requestPasswordReset(email: string) {
		return await authRepository.requestPasswordReset(email);
	}

	async updatePassword(newPassword: string) {
		return await authRepository.resetPassword(newPassword);
	}
}

export const authService = new AuthService();
