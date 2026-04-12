export const AVATAR_COLORS = [
  "#2196F3", "#4CAF50", "#FF9800", "#9C27B0",
  "#00BCD4", "#F44336", "#3F51B5", "#795548",
];

const HASH_MODULUS = 2_147_483_647;

export function seededIndex(id: string, max: number): number {
  let hash = 0;
  for (const char of id) {
    hash = Math.trunc((hash * 31 + (char.codePointAt(0) ?? 0)) % HASH_MODULUS);
  }
  return hash % max;
}

export function getAvatarColor(id: string): string {
  return AVATAR_COLORS[seededIndex(id, AVATAR_COLORS.length)];
}

const SPECIALTIES = [
  "Technician", "Specialist", "Expert", "Installation Specialist",
  "Maintenance Expert", "Repair Specialist",
];

/**
 * Derive deterministic extras from a technician ID.
 * Replaced by real API data later.
 */
export function deriveTechnicianExtras(id: string) {
  return {
    specialty: SPECIALTIES[seededIndex(`${id}s`, SPECIALTIES.length)],
    rating: +(4.5 + (seededIndex(`${id}r`, 5) * 0.1)).toFixed(1),
    reviewCount: 50 + seededIndex(`${id}c`, 280),
    yearsExp: 3 + seededIndex(`${id}y`, 15),
  };
}

/** Build a readable location label: "2.3 km · Cairo, Main St" */
export function formatLocation(
  distanceKm: number | null,
  city: string | null,
  street: string | null,
): string {
  const parts: string[] = [];
  if (city) parts.push(city);
  if (street) parts.push(street);
  const place = parts.join(", ") || null;

  if (distanceKm != null && place) return `${distanceKm.toFixed(1)} km · ${place}`;
  if (distanceKm != null) return `${distanceKm.toFixed(1)} km away`;
  return place ?? "No location";
}
