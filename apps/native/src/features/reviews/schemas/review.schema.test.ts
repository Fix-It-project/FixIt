import { describe, expect, test } from "vitest";
import {
  createReviewClientSchema,
  technicianReviewSchema,
  technicianReviewsResponseSchema,
} from "./review.schema";

const VALID_ORDER_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("createReviewClientSchema", () => {
  describe("valid inputs", () => {
    test("accepts rating only (no comment)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 3,
      });
      expect(result.success).toBe(true);
    });

    test("accepts minimum rating (1)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 1,
      });
      expect(result.success).toBe(true);
    });

    test("accepts maximum rating (5)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 5,
      });
      expect(result.success).toBe(true);
    });

    test("accepts rating with comment", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 3,
        comment: "Great work!",
      });
      expect(result.success).toBe(true);
    });

    // The trimmedOptionalComment preprocessor converts whitespace-only strings
    // to `undefined`, making the comment absent (optional field) — so this passes.
    test("whitespace-only comment is treated as absent (preprocess converts to undefined)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 3,
        comment: "   ",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.comment).toBeUndefined();
      }
    });
  });

  describe("invalid inputs", () => {
    test("rejects missing rating (rating is REQUIRED on client)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
      });
      expect(result.success).toBe(false);
    });

    test("rejects rating below minimum (0)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 0,
      });
      expect(result.success).toBe(false);
    });

    test("rejects rating above maximum (6)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 6,
      });
      expect(result.success).toBe(false);
    });

    test("rejects non-integer rating (2.5)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 2.5,
      });
      expect(result.success).toBe(false);
    });

    test("rejects invalid UUID for order_id", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: "not-a-uuid",
        rating: 3,
      });
      expect(result.success).toBe(false);
    });

    // NOTE: The trimmedOptionalComment preprocessor converts "" (empty string) to
    // `undefined` (same as whitespace-only), so comment becomes absent and the
    // schema passes since comment is optional. An empty comment is therefore NOT
    // rejected — it is treated the same as omitting the comment entirely.
    test("empty string comment is treated as absent (preprocess converts to undefined)", () => {
      const result = createReviewClientSchema.safeParse({
        order_id: VALID_ORDER_ID,
        rating: 3,
        comment: "",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.comment).toBeUndefined();
      }
    });

    test("rejects empty object (both order_id and rating missing)", () => {
      const result = createReviewClientSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    test("rejects missing order_id", () => {
      const result = createReviewClientSchema.safeParse({ rating: 3 });
      expect(result.success).toBe(false);
    });
  });
});

describe("technicianReviewSchema", () => {
  const fullReview = {
    id: "abc-123",
    rating: 4,
    comment: "Excellent service",
    created_at: "2024-01-01T10:00:00Z",
    reviewer_name: "John Doe",
  };

  test("parses full review with all fields non-null", () => {
    const result = technicianReviewSchema.safeParse(fullReview);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBe(4);
      expect(result.data.comment).toBe("Excellent service");
      expect(result.data.reviewer_name).toBe("John Doe");
    }
  });

  test("allows null fields (rating, comment, reviewer_name)", () => {
    const result = technicianReviewSchema.safeParse({
      id: "abc-123",
      rating: null,
      comment: null,
      created_at: "2024-01-01T10:00:00Z",
      reviewer_name: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rating).toBeNull();
      expect(result.data.comment).toBeNull();
      expect(result.data.reviewer_name).toBeNull();
    }
  });

  test("rejects missing required id field", () => {
    const result = technicianReviewSchema.safeParse({
      rating: 4,
      comment: "Good",
      created_at: "2024-01-01T10:00:00Z",
      reviewer_name: "Jane",
    });
    expect(result.success).toBe(false);
  });
});

describe("technicianReviewsResponseSchema", () => {
  test("parses empty reviews list", () => {
    const result = technicianReviewsResponseSchema.safeParse({ data: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reviews).toHaveLength(0);
    }
  });

  test("parses list with one valid review", () => {
    const result = technicianReviewsResponseSchema.safeParse({
      data: [
        {
          id: "review-1",
          rating: 5,
          comment: "Perfect!",
          created_at: "2024-06-01T08:00:00Z",
          reviewer_name: "Alice",
        },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reviews).toHaveLength(1);
      expect(result.data.reviews[0].rating).toBe(5);
    }
  });

  test("normalizes server data field to client reviews field", () => {
    const result = technicianReviewsResponseSchema.safeParse({ data: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ reviews: [] });
    }
  });

  test("rejects missing data field", () => {
    const result = technicianReviewsResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
