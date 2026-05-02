import { describe, expect, it } from "vitest";
import {
  applyReviewFlagsToOrders,
  type Order,
} from "../../orders.repository.js";

const baseOrder = (id: string, status: Order["status"] = "completed"): Order => ({
  id,
  technician_id: "tech-1",
  user_id: "user-1",
  service_id: "service-1",
  status,
  problem_description: null,
  attachment: null,
  cancellation_reason: null,
  scheduled_date: "2026-05-02",
  active: false,
  created_at: "2026-05-02T10:00:00.000Z",
  has_review: false,
});

describe("applyReviewFlagsToOrders", () => {
  it("marks orders that already have a review", () => {
    const orders = [baseOrder("order-1"), baseOrder("order-2")];

    const result = applyReviewFlagsToOrders(orders, new Set(["order-2"]));

    expect(result).toMatchObject([
      { id: "order-1", has_review: false },
      { id: "order-2", has_review: true },
    ]);
  });

  it("preserves non-review order fields", () => {
    const orders = [baseOrder("order-1", "accepted")];

    const result = applyReviewFlagsToOrders(orders, new Set(["order-1"]));

    expect(result[0]).toMatchObject({
      id: "order-1",
      status: "accepted",
      technician_id: "tech-1",
      has_review: true,
    });
  });
});
