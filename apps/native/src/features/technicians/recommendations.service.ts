import { env } from "@FixIt/env/native";
import { AppError, mapHttpStatus } from "@FixIt/errors";
import * as SecureStore from "expo-secure-store";
import apiClient from "@/src/config/api-client";
import { supabase } from "@/src/config/supabase";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import { logger } from "@/src/lib/logger";
import { useAuthStore } from "@/src/stores/auth-store";
import { recommendationsResponseSchema } from "./schemas/response.schema";

const RECOMMENDER_BASE_URL = env.EXPO_PUBLIC_RECOMMENDATION_API_URL;
const MIN_RECOMMENDATION_DESCRIPTION_LENGTH = 5;
const NO_RECOMMENDATIONS_DETAIL =
	"No technicians found within the search radius.";

function requireRecommendationBaseUrl() {
	if (!RECOMMENDER_BASE_URL) {
		throw new Error("EXPO_PUBLIC_RECOMMENDATION_API_URL is not configured");
	}

	const baseUrl = RECOMMENDER_BASE_URL.replace(/\/+$/, "");
	return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
}

export function normalizeRecommendationProblemDescription(
	value: string,
): string {
	const trimmed = value.trim();
	if (trimmed.length >= MIN_RECOMMENDATION_DESCRIPTION_LENGTH) return trimmed;
	if (trimmed.length === 0) return "General home service needed";
	return `Need ${trimmed} service`;
}

function parseRecommendationErrorBody(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

function toRecommendationHttpError(status: number, text: string): AppError {
	const details = parseRecommendationErrorBody(text);
	const mapped = mapHttpStatus(status, details);

	return new AppError(mapped.code, mapped.userMessage, {
		...mapped.opts,
		status,
		details,
		devMessage: `recommendation_api_${status}: ${text}`,
	});
}

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
		problem_description: normalizeRecommendationProblemDescription(
			payload.problemDescription,
		),
		latitude: finalLatitude,
		longitude: finalLongitude,
		radius_km: payload.radiusKm ?? 10,
		top_k: payload.topK ?? 10,
	};

	const res = await fetch(`${requireRecommendationBaseUrl()}/recommend`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"ngrok-skip-browser-warning": "true",
			...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
		},
		body: JSON.stringify(body),
	});

	const text = await res.text();

	if (res.status === 404 && text.includes(NO_RECOMMENDATIONS_DETAIL)) {
		return [];
	}

	if (!res.ok) throw toRecommendationHttpError(res.status, text);

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
		logger.warn("recommend", "backend address fetch failed", {
			error: String(error),
		});
		return null;
	}
}
