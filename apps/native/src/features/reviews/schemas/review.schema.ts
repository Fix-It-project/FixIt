import { z } from "zod";

// ─── Response schemas ─────────────────────────────────────────────────────────

export const technicianReviewSchema = z.object({
  id: z.string(),
  rating: z.number().nullable(),
  comment: z.string().nullable(),
  created_at: z.string(),
  reviewer_name: z.string().nullable(),
});

export const technicianReviewsResponseSchema = z
  .object({
    data: z.array(technicianReviewSchema),
  })
  .transform(({ data }) => ({
    reviews: data,
  }));

// Aggregate rating summary (avg + count + per-star distribution) for a technician.
export const reviewSummarySchema = z.object({
  avg_rating: z.number().nullable(),
  review_count: z.number(),
  distribution: z.object({
    "1": z.number(),
    "2": z.number(),
    "3": z.number(),
    "4": z.number(),
    "5": z.number(),
  }),
});

export const reviewSummaryResponseSchema = z.object({
  data: reviewSummarySchema,
});

// ─── Client-side create schema ────────────────────────────────────────────────
// Client UX rule: rating is REQUIRED (server allows comment-only, we don't).
// comment: optional, but if provided must be 1-1000 chars after trim.

const trimmedOptionalComment = z.preprocess((v) => {
  if (typeof v !== "string") return v;
  const trimmed = v.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).max(1000).optional());

export const createReviewClientSchema = z.object({
  order_id: z.string().uuid("order_id must be a valid UUID"),
  rating: z.number().int().min(1).max(5),
  comment: trimmedOptionalComment,
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type TechnicianReviewFromSchema = z.infer<typeof technicianReviewSchema>;
export type TechnicianReviewsResponse = z.infer<
  typeof technicianReviewsResponseSchema
>;
export type CreateReviewClientInput = z.infer<typeof createReviewClientSchema>;
export type ReviewSummary = z.infer<typeof reviewSummarySchema>;
