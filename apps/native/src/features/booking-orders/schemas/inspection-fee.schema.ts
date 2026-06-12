import { z } from "zod";

export const inspectionFeePreviewSchema = z.object({
	inspection_fee: z.number().int().nonnegative(),
	inspection_distance_km: z.number().nonnegative(),
});

export const inspectionFeePreviewResponseSchema = z.object({
	data: inspectionFeePreviewSchema,
});

export type InspectionFeePreview = z.infer<typeof inspectionFeePreviewSchema>;
export type InspectionFeePreviewResponse = z.infer<
	typeof inspectionFeePreviewResponseSchema
>;
