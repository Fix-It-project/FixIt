import { z } from "zod";

const numericLikeSchema = z
	.union([z.number(), z.string()])
	.transform((value) => {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	});

const stringLikeSchema = z
	.union([z.string(), z.number()])
	.transform((value) => String(value));

function normalizeSeverity(value: unknown): "low" | "medium" | "high" {
	const normalized = String(value ?? "")
		.trim()
		.toLowerCase();

	if (normalized === "low") return "low";
	if (normalized === "high") return "high";
	if (normalized === "medium") return "medium";
	if (normalized.includes("high")) return "high";
	if (normalized.includes("low")) return "low";
	return "medium";
}

const rawAssignedTechnicianSchema = z
	.object({
		id: z.union([z.string(), z.number(), z.null()]).optional(),
		name: z.string().nullable().optional(),
		category: z.union([z.string(), z.null()]).optional(),
		distance_km: numericLikeSchema.optional(),
		match_score: numericLikeSchema.optional(),
		trust_score: numericLikeSchema.nullable().optional(),
		hourly_rate_egp: numericLikeSchema.nullable().optional(),
		base_hourly_rate: numericLikeSchema.nullable().optional(),
	})
	.nullish()
	.transform((value) => ({
		id: value?.id,
		name: value?.name ?? null,
		category: value?.category ?? "",
		distance_km: value?.distance_km ?? 0,
		match_score: value?.match_score ?? 0,
		trust_score: value?.trust_score ?? null,
		hourly_rate_egp:
			value?.hourly_rate_egp ?? value?.base_hourly_rate ?? null,
	}));

const recommendationSchema = z
	.object({
		id: z.union([z.string(), z.number()]).optional(),
		technician_id: z.union([z.string(), z.number()]).optional(),
		name: z.string().nullable().optional(),
		category: z.string().nullable().optional(),
		match_score: numericLikeSchema.optional(),
		distance_km: numericLikeSchema.optional(),
		trust_score: numericLikeSchema.nullable().optional(),
		hourly_rate_egp: numericLikeSchema.nullable().optional(),
		base_hourly_rate: numericLikeSchema.nullable().optional(),
	})
	.transform((value) => ({
		...value,
		id: String(value.id ?? value.technician_id ?? ""),
		name: value.name ?? "",
		category: value.category ?? "",
		match_score: value.match_score ?? 0,
		distance_km: value.distance_km ?? 0,
		trust_score: value.trust_score ?? null,
		hourly_rate_egp:
			value.hourly_rate_egp ?? value.base_hourly_rate ?? null,
	}));

const serviceOrderSchema = z
	.object({
		diagnosed_category: stringLikeSchema.catch("unknown"),
		problem_summary: stringLikeSchema.catch(""),
		severity_estimate: z.unknown().transform(normalizeSeverity),
		assigned_technician: rawAssignedTechnicianSchema.optional(),
		all_recommendations: z.array(recommendationSchema).optional().catch([]),
		recommendations: z.array(recommendationSchema).optional().catch([]),
		estimated_cost_range_egp: z
			.union([z.string(), z.number()])
			.transform((value) => String(value))
			.optional(),
		user_id: z.union([z.string(), z.number(), z.null()]).optional(),
		engine_used: z.union([z.string(), z.number()]).transform(String).optional(),
	})
	.transform((value) => {
		const recommendations =
			value.all_recommendations ?? value.recommendations ?? [];

		return {
			...value,
			assigned_technician: value.assigned_technician ?? {
				id: undefined,
				name: null,
				category: "",
				distance_km: 0,
				match_score: 0,
				trust_score: null,
				hourly_rate_egp: null,
			},
			all_recommendations: recommendations,
		};
	});

export const diagnoseResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		service_order: serviceOrderSchema.nullable().optional(),
		assistant_message: z.string().optional(),
	}),
	meta: z
		.object({
			duration_ms: z.number().optional(),
		})
		.optional(),
});

export type DiagnoseResponse = z.infer<typeof diagnoseResponseSchema>;
export type ServiceOrder = z.infer<typeof serviceOrderSchema>;
