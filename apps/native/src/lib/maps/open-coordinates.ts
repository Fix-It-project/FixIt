import { Linking } from "react-native";

/**
 * Open a coordinate in the device's default maps app (Google/Apple Maps) using
 * latitude/longitude only. No-op when either coordinate is missing.
 */
export function openCoordinatesInMaps(
	latitude: number | null | undefined,
	longitude: number | null | undefined,
): void {
	if (latitude == null || longitude == null) return;
	const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
	void Linking.openURL(url);
}
