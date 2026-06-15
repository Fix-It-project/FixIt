import { env } from "@FixIt/env/native";

const STATIC_MAP_BASE = "https://maps.googleapis.com/maps/api/staticmap";
// Google Static Maps free size limit is 640 per side; `scale=2` doubles the
// rendered pixels for crisp output without changing the requested size.
const MAX_DIM = 640;
const MARKER_COLOR = "0x1A73E8"; // Google-blue pin.

interface StaticMapOptions {
	latitude: number;
	longitude: number;
	width: number;
	height: number;
	zoom?: number;
}

/**
 * Builds a Google Static Maps URL with a centered marker. Returns `null` when
 * the API key is missing so callers can fall back to a non-map state.
 *
 * The URL embeds the API key — never log it.
 */
export function buildStaticMapUrl({
	latitude,
	longitude,
	width,
	height,
	zoom = 16,
}: StaticMapOptions): string | null {
	const key = env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
	if (!key) return null;

	const w = Math.min(Math.max(1, Math.round(width)), MAX_DIM);
	const h = Math.min(Math.max(1, Math.round(height)), MAX_DIM);
	const center = `${latitude},${longitude}`;

	const params = new URLSearchParams({
		center,
		zoom: String(zoom),
		size: `${w}x${h}`,
		scale: "2",
		markers: `color:${MARKER_COLOR}|${center}`,
		key,
	});

	return `${STATIC_MAP_BASE}?${params.toString()}`;
}
