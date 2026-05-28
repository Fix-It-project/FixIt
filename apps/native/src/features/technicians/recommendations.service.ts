import * as SecureStore from "expo-secure-store";
import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import { logger } from "@/src/lib/logger";
import { supabase } from "@/src/config/supabase";
import { useAuthStore } from "@/src/stores/auth-store";
import { recommendationsResponseSchema } from "./schemas/response.schema";

const RECOMMENDER_BASE_URL = process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL;

async function readSecureStoreAuthFallback(): Promise<{
	userUuid: string | null;
	accessToken: string | null;
}> {
	// Keep keys aligned with your AuthStore implementation.
	// Try common key variants to avoid mismatch.
	const userRaw =
		(await SecureStore.getItemAsync("user")) ??
		(await SecureStore.getItemAsync("auth_user")) ??
		null;

	const accessToken =
		(await SecureStore.getItemAsync("accessToken")) ??
		(await SecureStore.getItemAsync("access_token")) ??
		(await SecureStore.getItemAsync("auth_access_token")) ??
		null;

	let userUuid: string | null = null;
	if (userRaw) {
		try {
			const parsed = JSON.parse(userRaw) as { id?: string };
			userUuid = parsed?.id ?? null;
		} catch {
			userUuid = null;
		}
	}

	return { userUuid, accessToken };
}

export async function getRecommendedTechnicians(payload: {
	problemDescription: string;
	latitude?: number;
	longitude?: number;
	radiusKm?: number;
	topK?: number;
}) {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	let accessToken = session?.access_token ?? null;
	let userUuid = session?.user?.id ?? null;

	if (!userUuid) {
		const { data } = await supabase.auth.getUser();
		userUuid = data.user?.id ?? null;
	}

	if (!userUuid || !accessToken) {
		const auth = useAuthStore.getState() as {
			user?: { id?: string } | null;
			accessToken?: string | null;
		};
		userUuid = userUuid ?? auth.user?.id ?? null;
		accessToken = accessToken ?? auth.accessToken ?? null;
	}

	if (!userUuid || !accessToken) {
		const stored = await readSecureStoreAuthFallback();
		userUuid = userUuid ?? stored.userUuid;
		accessToken = accessToken ?? stored.accessToken;
	}

	const addr = await getUserAddressCoords();

	const finalLatitude = addr?.latitude ?? payload.latitude;
	const finalLongitude = addr?.longitude ?? payload.longitude;

	if (finalLatitude == null || finalLongitude == null) {
		throw new Error("recommendation_location_required");
	}

	const body = {
		user_id: userUuid,
		problem_description: payload.problemDescription,
		latitude: finalLatitude,
		longitude: finalLongitude,
		radius_km: payload.radiusKm ?? 10,
		top_k: payload.topK ?? 10,
	};

	const res = await fetch(`${RECOMMENDER_BASE_URL}/api/recommend`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
		},
		body: JSON.stringify(body),
	});

	const text = await res.text();

	if (!res.ok) throw new Error(`recommendation_api_${res.status}: ${text}`);

	const json = JSON.parse(text);
	return safeParseResponse(
		recommendationsResponseSchema,
		json,
		"getRecommendedTechnicians",
	).recommendations;
}

type UserAddressDto = {
	id: string;
	latitude: number | null;
	longitude: number | null;
	is_active: boolean;
	created_at: string;
};

export async function getUserAddressCoords(): Promise<{
	latitude: number;
	longitude: number;
} | null> {
	try {
		const { data } = await apiClient.get("/api/addresses/user/addresses");

		// handle both response shapes:
		// 1) Address[]
		// 2) { addresses: Address[] }
		let rows: UserAddressDto[] = [];
		if (Array.isArray(data)) {
			rows = data;
		} else if (Array.isArray(data?.addresses)) {
			rows = data.addresses;
		}

		if (!rows.length) return null;

		// prefer active address
		const active = rows.find(
			(a) => a.is_active && a.latitude != null && a.longitude != null,
		);
		if (active)
			return {
				latitude: Number(active.latitude),
				longitude: Number(active.longitude),
			};

		// fallback to latest with coords
		const latest = [...rows]
			.filter((a) => a.latitude != null && a.longitude != null)
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			)[0];

		if (!latest) return null;
		return {
			latitude: Number(latest.latitude),
			longitude: Number(latest.longitude),
		};
	} catch (error) {
		logger.warn("recommend", "backend address fetch failed", { error: String(error) });
		return null;
	}
}
