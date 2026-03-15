import { getDistance } from 'geolib';

/**
 * Calculate the great-circle distance between two GPS coordinates.
 * Uses the `geolib` library under the hood (Haversine formula).
 *
 * @returns Distance in kilometres, rounded to 1 decimal place.
 */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const meters = getDistance(
    { latitude: lat1, longitude: lon1 },
    { latitude: lat2, longitude: lon2 },
  );
  return Math.round((meters / 1000) * 10) / 10;
}
