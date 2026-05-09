import { z } from "zod";

const trimmedComment = z.preprocess((v) => {
	if (typeof v !== "string") return v;
	const trimmed = v.trim();
	return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).max(1000).optional());

export const CreateReviewBodySchema = z
	.object({
		order_id: z.string().uuid("order_id must be a valid UUID"),
		rating: z.number().int().min(1).max(5).optional(),
		comment: trimmedComment,
	})
	.refine((v) => v.rating !== undefined || v.comment !== undefined, {
		message: "At least one of rating or comment is required",
	});

export const TechnicianReviewsQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;
export type TechnicianReviewsQuery = z.infer<
	typeof TechnicianReviewsQuerySchema
>;
