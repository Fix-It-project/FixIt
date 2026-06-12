import { describe, expect, it } from "vitest";
import {
	calculateInspectionFeePreview,
	getInspectionFeeFromDistance,
} from "../../inspection-pricing.js";

describe("getInspectionFeeFromDistance", () => {
	it.each([
		{ distance: 5.0, fee: 100 },
		{ distance: 5.1, fee: 150 },
		{ distance: 10.0, fee: 150 },
		{ distance: 10.1, fee: 200 },
		{ distance: 20.0, fee: 200 },
		{ distance: 20.1, fee: 250 },
	])("maps $distance km to $fee EGP", ({ distance, fee }) => {
		expect(getInspectionFeeFromDistance(distance)).toBe(fee);
	});
});

describe("calculateInspectionFeePreview", () => {
	it("returns rounded distance and the matching fee band", () => {
		const preview = calculateInspectionFeePreview({
			technicianLatitude: 30.0444,
			technicianLongitude: 31.2357,
			destinationLatitude: 30.0561,
			destinationLongitude: 31.2394,
		});

		expect(preview.inspection_distance_km).toBeTypeOf("number");
		expect(preview.inspection_distance_km).toBeGreaterThan(0);
		expect(preview.inspection_fee).toBeGreaterThan(0);
	});
});
