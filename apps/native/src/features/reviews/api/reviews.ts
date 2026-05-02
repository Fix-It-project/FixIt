import apiClient from "@/src/lib/api-client";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import {
  type CreateReviewClientInput,
  type TechnicianReviewsResponse,
  createReviewClientSchema,
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
 * GET /api/technicians/:id/reviews
 * Fetches paginated reviews for a specific technician. Requires user-auth.
 */
export async function getTechnicianReviews(
  technicianId: string,
  params: TechnicianReviewsParams = {},
): Promise<TechnicianReviewsResponse> {
  const { data } = await apiClient.get(
    `/api/technicians/${technicianId}/reviews`,
    { params },
  );
  return safeParseResponse(
    technicianReviewsResponseSchema,
    data,
    "getTechnicianReviews",
  );
}

/**
 * GET /api/technicians/me/reviews
 * Fetches paginated reviews for the authenticated technician. Requires technician-auth.
 */
export async function getMyTechnicianReviews(
  params: TechnicianReviewsParams = {},
): Promise<TechnicianReviewsResponse> {
  const { data } = await apiClient.get("/api/technicians/me/reviews", {
    params,
  });
  return safeParseResponse(
    technicianReviewsResponseSchema,
    data,
    "getMyTechnicianReviews",
  );
}
