import { recommendationsResponseSchema } from "./schemas/response.schema";
import { supabase } from "@/src/lib/supabase";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@/src/stores/auth-store";
import apiClient from "@/src/lib/api-client";

const RECOMMENDER_BASE_URL =
  process.env.EXPO_PUBLIC_RECOMMENDATION_API_URL;

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

  const finalLatitude = addr?.latitude ?? payload.latitude ?? 30.0444;
  const finalLongitude = addr?.longitude ?? payload.longitude ?? 31.2357;

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

  const json = JSON.parse(text) as { recommendations?: Array<{ technician_id: string }> };
  return json.recommendations ?? [];
}

type UserAddressDto = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
};

export async function getUserAddressCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { data } = await apiClient.get("/api/addresses/user/addresses");

    // handle both response shapes:
    // 1) Address[]
    // 2) { addresses: Address[] }
    const rows: UserAddressDto[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.addresses)
        ? data.addresses
        : [];

    if (!rows.length) return null;

    // prefer active address
    const active = rows.find((a) => a.is_active && a.latitude != null && a.longitude != null);
    if (active) return { latitude: Number(active.latitude), longitude: Number(active.longitude) };

    // fallback to latest with coords
    const latest = [...rows]
      .filter((a) => a.latitude != null && a.longitude != null)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )[0];

    if (!latest) return null;
    return { latitude: Number(latest.latitude), longitude: Number(latest.longitude) };
  } catch (error) {
    console.log("[recommend][addr] backend address fetch failed:", error);
    return null;
  }
}