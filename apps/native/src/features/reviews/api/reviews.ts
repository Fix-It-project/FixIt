import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type CreateReviewClientInput,
	createReviewClientSchema,
	type ReviewSummary,
	reviewSummaryResponseSchema,
	type TechnicianReviewsResponse,
	technicianReviewsResponseSchema,
} from "../schemas/review.schema";
import type { TechnicianReviewsParams } from "../types";

/**
 * POST /api/reviews
 * Submits a review for a completed order. Requires user-auth (handled by apiClient interceptors).
 * Validates the body client-side with createReviewClientSchema before sending.
 */
export async function createReview(
	input: CreateReviewClientInput,
): Promise<void> {
	// Validate on client before network call
	createReviewClientSchema.parse(input);
	await apiClient.post("/api/reviews", input);
}

/**
 * GET /api/reviews/technicians/:id
 * Fetches paginated reviews for a specific technician. Requires user-auth.
 */
export async function getTechnicianReviews(
	technicianId: string,
	params: TechnicianReviewsParams = {},
): Promise<TechnicianReviewsResponse> {
	const { data } = await apiClient.get(
		`/api/reviews/technicians/${technicianId}`,
		{ params },
	);
	return safeParseResponse(
		technicianReviewsResponseSchema,
		data,
		"getTechnicianReviews",
	);
}

/**
 * GET /api/reviews/technicians/:id/summary
 * Aggregate rating summary (avg, count, per-star distribution). Requires user-auth.
 */
export async function getReviewSummary(
	technicianId: string,
): Promise<ReviewSummary> {
	const { data } = await apiClient.get(
		`/api/reviews/technicians/${technicianId}/summary`,
	);
	return safeParseResponse(
		reviewSummaryResponseSchema,
		data,
		"getReviewSummary",
	).data;
}
