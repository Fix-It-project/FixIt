/**
 * Minimal display shape for a single review.
 *
 * Owned by the shared components layer. Feature-side schema types
 * (e.g. `TechnicianReviewFromSchema`) are structurally compatible and
 * can be passed directly to `<ReviewRow>` / consumers without conversion.
 */
export interface Review {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
}
