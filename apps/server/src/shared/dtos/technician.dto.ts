import { z } from "zod";

export const TechnicianSortSchema = z.enum([
	"top_rated",
	"most_reviews",
	"nearest",
]);
export type TechnicianSort = z.infer<typeof TechnicianSortSchema>;

// `lat`/`lng` are kept as raw strings — parseCoords() does the numeric parsing.
// They MUST be declared here: the validate() middleware replaces req.query with
// the parsed schema output, and Zod strips any key the schema doesn't list.
export const TechnicianListQuerySchema = z.object({
	sort: TechnicianSortSchema.optional(),
	lat: z.string().optional(),
	lng: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});
export type TechnicianListQuery = z.infer<typeof TechnicianListQuerySchema>;

// Search reuses the list query and additionally requires `q`. Without `q` in the
// schema the validate() middleware would strip it, breaking every search request.
export const TechnicianSearchQuerySchema = TechnicianListQuerySchema.extend({
	q: z.string().trim().min(1, 'Query parameter "q" is required'),
});
export type TechnicianSearchQuery = z.infer<typeof TechnicianSearchQuerySchema>;

export const UpdateTechnicianSelfBodySchema = z
	.object({
		first_name: z.string().min(1).optional(),
		last_name: z.string().min(1).optional(),
		phone: z.string().optional(),
		description: z.string().optional(),
	})
	.refine((data) => Object.values(data).some((v) => v !== undefined), {
		message:
			"At least one field (first_name, last_name, phone, description) is required",
	});

export const TechnicianIdParamsSchema = z.object({
	id: z.string().uuid("Technician ID must be a valid UUID"),
});

export type UpdateTechnicianSelfBody = z.infer<
	typeof UpdateTechnicianSelfBodySchema
>;
