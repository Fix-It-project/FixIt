import type { Request } from 'express';

/**
 * Extract optional `lat` and `lng` query-string parameters from an
 * Express request and parse them into numbers.
 *
 * Returns an empty object when either value is missing or not a valid number.
 */
export function parseCoords(req: Request): { lat?: number; lng?: number } {
  const rawLat = req.query.lat as string | undefined;
  const rawLng = req.query.lng as string | undefined;
  if (rawLat == null || rawLng == null) return {};

  const lat = Number.parseFloat(rawLat);
  const lng = Number.parseFloat(rawLng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return {};

  return { lat, lng };
}
