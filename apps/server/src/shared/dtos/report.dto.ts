import { z } from "zod";

/** Predefined report labels (problem reasons). The DB column CHECK holds the
 *  union; `submit_report` enforces which subset is valid per direction. */
export const CreateReportBodySchema = z.object({
	orderId: z.string().uuid("Invalid order id"),
	label: z.enum([
		// user -> technician
		"no_show",
		"unprofessional",
		"overcharged",
		"poor_quality",
		"safety_concern",
		// technician -> user
		"abusive",
		"refused_payment",
		"unsafe_dishonest",
		// both
		"other",
	]),
	summary: z
		.string()
		.trim()
		.min(1, "Summary is required")
		.max(2000, "Summary too long"),
});

export const ReportIdParamSchema = z.object({
	id: z.string().uuid("Invalid report id"),
});

/** Query params for the server-side admin reports queue (pagination + filters). */
export const ReportsListQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(20),
	status: z.enum(["open", "closed"]).default("open"),
	source: z.enum(["all", "user", "technician"]).default("all"),
});

export type CreateReportBody = z.infer<typeof CreateReportBodySchema>;
export type ReportIdParam = z.infer<typeof ReportIdParamSchema>;
export type ReportsListQuery = z.infer<typeof ReportsListQuerySchema>;
