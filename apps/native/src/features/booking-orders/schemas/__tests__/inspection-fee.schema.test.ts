import { describe, expect, it } from "vitest";
import {
	inspectionFeePreviewResponseSchema,
	inspectionFeePreviewSchema,
} from "../inspection-fee.schema";

describe("inspectionFeePreviewSchema", () => {
	it("parses the preview payload", () => {
		const result = inspectionFeePreviewSchema.parse({
			inspection_fee: 150,
			inspection_distance_km: 7.4,
		});

		expect(result).toEqual({
			inspection_fee: 150,
			inspection_distance_km: 7.4,
		});
	});

	it("rejects negative fee values", () => {
		expect(
			inspectionFeePreviewSchema.safeParse({
				inspection_fee: -10,
				inspection_distance_km: 2.5,
			}).success,
		).toBe(false);
	});
});

describe("inspectionFeePreviewResponseSchema", () => {
	it("parses the standard { data } envelope", () => {
		const result = inspectionFeePreviewResponseSchema.parse({
			data: {
				inspection_fee: 250,
				inspection_distance_km: 22.1,
			},
		});

		expect(result.data.inspection_fee).toBe(250);
		expect(result.data.inspection_distance_km).toBe(22.1);
	});
});
