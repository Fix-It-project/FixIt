import { distanceKm } from "../shared/utils/technicians/geo.js";

export interface InspectionFeeBand {
	maxDistanceKm: number | null;
	fee: number;
}

export interface InspectionFeePreview {
	inspection_fee: number;
	inspection_distance_km: number;
}

export const INSPECTION_FEE_BANDS: readonly InspectionFeeBand[] = [
	{ maxDistanceKm: 5, fee: 100 },
	{ maxDistanceKm: 10, fee: 150 },
	{ maxDistanceKm: 20, fee: 200 },
	{ maxDistanceKm: null, fee: 250 },
] as const;

export function getInspectionFeeFromDistance(distance: number): number {
	for (const band of INSPECTION_FEE_BANDS) {
		if (band.maxDistanceKm === null || distance <= band.maxDistanceKm) {
			return band.fee;
		}
	}
	return INSPECTION_FEE_BANDS[INSPECTION_FEE_BANDS.length - 1]?.fee ?? 250;
}

export function calculateInspectionFeePreview(args: {
	technicianLatitude: number;
	technicianLongitude: number;
	destinationLatitude: number;
	destinationLongitude: number;
}): InspectionFeePreview {
	const inspection_distance_km = distanceKm(
		args.technicianLatitude,
		args.technicianLongitude,
		args.destinationLatitude,
		args.destinationLongitude,
	);

	return {
		inspection_fee: getInspectionFeeFromDistance(inspection_distance_km),
		inspection_distance_km,
	};
}
