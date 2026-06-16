import { AppError } from "../../shared/errors/app-error.js";
import {
	addressesRepository,
	type SignUpAddressData,
} from "../addresses/addresses.repository.js";
import { techniciansRepository } from "../technicians/technicians.repository.js";
import { usersRepository } from "../users/index.js";
import {
	authRepository,
	type SignInData,
	type SignUpData,
} from "./auth.repository.js";

/** Supabase auth user shape attached to the request by requireUserAuth. */
interface OAuthUser {
	id: string;
	email?: string | null;
	user_metadata?: { full_name?: string; name?: string } | null;
}

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

	/**
	 * Whether an OAuth-authenticated user still needs to finish onboarding —
	 * i.e. has no domain `users` row yet, or no (non-deleted) address. Also
	 * rejects identities that belong to a technician.
	 */
	async oauthStatus(user: OAuthUser) {
		await this.assertNotTechnician(user);

		const existing = await usersRepository.getUserByIdOrNull(user.id);
		const addressCount = await addressesRepository.getAddressCountByUserId(
			user.id,
		);

		return { needsProfile: !existing || addressCount === 0 };
	}

	/**
	 * Creates the domain user + address rows for a Google OAuth user. Idempotent:
	 * `createUser`/`createAddress` are plain inserts, so we check-then-create to
	 * avoid PK conflicts / duplicate addresses when the step is retried.
	 */
	async completeOAuthProfile(
		user: OAuthUser,
		addressData: SignUpAddressData,
		profile: { fullName?: string; phone?: string },
	) {
		await this.assertNotTechnician(user);

		const existing = await usersRepository.getUserByIdOrNull(user.id);
		if (!existing) {
			await usersRepository.createUser({
				id: user.id,
				email: user.email ?? "",
				fullName:
					profile.fullName ??
					user.user_metadata?.full_name ??
					user.user_metadata?.name,
				phone: profile.phone,
			});
		}

		const addressCount = await addressesRepository.getAddressCountByUserId(
			user.id,
		);
		if (addressCount === 0) {
			await addressesRepository.createAddress({
				user_id: user.id,
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
			user: { id: user.id, email: user.email },
			message: "Profile completed successfully.",
		};
	}

	/**
	 * Guards the user-side OAuth endpoints: the same Google identity (by email,
	 * and defensively by id) must not already be a technician account.
	 */
	private async assertNotTechnician(user: OAuthUser) {
		let technician: unknown = null;

		if (user.email) {
			technician = await techniciansRepository.getTechnicianByEmail(user.email);
		}

		if (!technician) {
			// `getTechnicianById` uses `.single()` and throws when absent — the
			// common case for a fresh OAuth identity, so swallow that.
			try {
				technician = await techniciansRepository.getTechnicianById(user.id);
			} catch {
				technician = null;
			}
		}

		if (technician) {
			throw AppError.forbidden(
				"This email is registered as a technician account.",
				{ token: "not_user_account" },
			);
		}
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

		// Blocking gate: a blocked homeowner cannot sign in. Mirrors the
		// technician gate's `accountStatus` discriminator so native handling is
		// symmetric; the block reason rides along for the Blocked screen.
		const blockedUser = userRecord as {
			blocked?: boolean;
			blocked_reason?: string | null;
		};
		if (blockedUser.blocked) {
			await Promise.resolve(
				authRepository.signOut(result.session?.access_token ?? ""),
			).catch(() => undefined);
			throw AppError.forbidden(
				"Your account has been blocked. Contact support for assistance.",
				{
					fields: {
						accountStatus: "blocked",
						...(blockedUser.blocked_reason
							? { blockReason: blockedUser.blocked_reason }
							: {}),
					},
				},
			);
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

		// Re-gate the refresh so a blocked account can't silently renew its session
		// for days (fail-open on read error). block_pending passes.
		const userId = result.user?.id;
		if (userId) {
			let blocked = false;
			try {
				const rec = await usersRepository.getUserById(userId);
				blocked = !!(rec as { blocked?: boolean } | null)?.blocked;
			} catch {
				// fail-open
			}
			if (blocked) {
				throw AppError.forbidden(
					"Your account has been blocked. Contact support for assistance.",
					{ fields: { accountStatus: "blocked" } },
				);
			}
		}

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
