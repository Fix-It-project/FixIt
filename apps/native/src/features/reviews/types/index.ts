/** A single review as returned by the server. */
export interface TechnicianReview {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
}

/** Pagination params accepted by list endpoints. */
export interface TechnicianReviewsParams {
  limit?: number;
  offset?: number;
}

/** Body sent to POST /api/reviews from the client. */
export interface CreateReviewInput {
  order_id: string;
  rating: number; // client always requires a rating (1-5)
  comment?: string; // optional; max 1000 chars
}
