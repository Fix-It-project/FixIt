import { seededIndex } from "@/src/lib/helpers/technician-utils";

const SPECIALTIES = [
  "Technician", "Specialist", "Expert", "Installation Specialist",
  "Maintenance Expert", "Repair Specialist",
];

/**
 * Derive deterministic extras from a technician ID.
 * Replaced by real API data later.
 */
export function derive(id: string) {
  return {
    specialty: SPECIALTIES[seededIndex(id + "s", SPECIALTIES.length)],
    rating: +(4.5 + (seededIndex(id + "r", 5) * 0.1)).toFixed(1),
    reviewCount: 50 + seededIndex(id + "c", 280),
    yearsExp: 3 + seededIndex(id + "y", 15),
  };
}
