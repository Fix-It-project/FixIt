import { z } from "zod";

const numericLikeSchema = z
    .union([z.number(), z.string()])
    .transform((value) => Number(value));

const assignedTechnicianSchema = z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    category: z.string().nullable().optional().catch(""),
    distance_km: numericLikeSchema.catch(0),
    match_score: numericLikeSchema.catch(0),
    trust_score: numericLikeSchema.nullable().optional(),
    hourly_rate_egp: numericLikeSchema.nullable().optional(),
});

const recommendationSchema = z.object({
    technician_id: z.union([z.string(), z.number()]).or(z.undefined()).transform((value) => value ?? ""),
    name: z.string(),
    category: z.string().nullable().optional(),
    match_score: numericLikeSchema.catch(0),
    distance_km: numericLikeSchema.catch(0),
    trust_score: numericLikeSchema.nullable().optional(),
    hourly_rate_egp: numericLikeSchema.nullable().optional(),
});

const rawServiceOrderSchema = z.object({
    diagnosed_category: z.string(),
    problem_summary: z.string(),
    severity_estimate: z.enum(["low", "medium", "high"]),
    assigned_technician: assignedTechnicianSchema,
    all_recommendations: z.array(recommendationSchema).optional(),
    recommendations: z.array(recommendationSchema).optional(),
    estimated_cost_range_egp: z.string().optional(),
    user_id: z.union([z.string(), z.number(), z.null()]).optional(),
    engine_used: z.string().optional(),
});

const serviceOrderSchema = rawServiceOrderSchema.transform((value) => ({
    ...value,
    all_recommendations: (value.all_recommendations ?? value.recommendations)?.map((recommendation) => ({
        ...recommendation,
        id: String(recommendation.technician_id),
    })),
}));

export const diagnoseResponseSchema = z.object({
    success: z.boolean(),
    data: z.object({
        service_order: serviceOrderSchema.nullable().optional(),
        assistant_message: z.string().optional(),
    }),
    meta: z.object({
        duration_ms: z.number().optional(),
    }).optional(),
});

export type DiagnoseResponse = z.infer<typeof diagnoseResponseSchema>;
export type ServiceOrder = z.infer<typeof serviceOrderSchema>;
