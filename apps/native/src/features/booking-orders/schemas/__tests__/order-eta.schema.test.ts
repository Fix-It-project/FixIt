import { describe, expect, test } from "vitest";
import {
	locationPingResponseSchema,
	orderDistanceResponseSchema,
	orderDistanceSchema,
} from "../order-eta.schema";

describe("orderDistanceSchema", () => {
	describe("valid inputs", () => {
		test("parses canonical in-range payload", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: 0.4,
				eta_minutes: 1,
				within_geofence: true,
			});
			expect(result.success).toBe(true);
		});

		test("parses out-of-geofence payload", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: 3.2,
				eta_minutes: 8,
				within_geofence: false,
			});
			expect(result.success).toBe(true);
		});

		test("parses null distance + null eta (no location ping yet)", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: null,
				eta_minutes: null,
				within_geofence: false,
			});
			expect(result.success).toBe(true);
		});

		test("accepts distance_km = 0", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: 0,
				eta_minutes: 0,
				within_geofence: true,
			});
			expect(result.success).toBe(true);
		});
	});

	describe("invalid inputs", () => {
		test("rejects non-integer eta_minutes", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: 1.5,
				eta_minutes: 3.5,
				within_geofence: false,
			});
			expect(result.success).toBe(false);
		});

		test("rejects string distance_km", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: "1.5",
				eta_minutes: 3,
				within_geofence: false,
			});
			expect(result.success).toBe(false);
		});

		test("rejects within_geofence as null", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: 1.5,
				eta_minutes: 3,
				within_geofence: null,
			});
			expect(result.success).toBe(false);
		});

		test("rejects within_geofence as string", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: null,
				eta_minutes: null,
				within_geofence: "false",
			});
			expect(result.success).toBe(false);
		});

		test("rejects missing within_geofence", () => {
			const result = orderDistanceSchema.safeParse({
				distance_km: 1.0,
				eta_minutes: 2,
			});
			expect(result.success).toBe(false);
		});

		test("rejects missing distance_km", () => {
			const result = orderDistanceSchema.safeParse({
				eta_minutes: 2,
				within_geofence: false,
			});
			expect(result.success).toBe(false);
		});
	});
});

describe("orderDistanceResponseSchema", () => {
	test("wraps a distance payload in { data }", () => {
		const result = orderDistanceResponseSchema.safeParse({
			data: {
				distance_km: 0.4,
				eta_minutes: 1,
				within_geofence: true,
			},
		});
		expect(result.success).toBe(true);
	});

	test("rejects missing data field", () => {
		const result = orderDistanceResponseSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	test("rejects malformed inner payload", () => {
		const result = orderDistanceResponseSchema.safeParse({
			data: {
				distance_km: "x",
				eta_minutes: 1,
				within_geofence: true,
			},
		});
		expect(result.success).toBe(false);
	});
});

describe("locationPingResponseSchema", () => {
	test("parses an arrival ping envelope", () => {
		const result = locationPingResponseSchema.safeParse({
			data: {
				arrived: true,
				location: { latitude: 30.1, longitude: 31.2 },
				order: { status: "tracking", arrived_at: "2026-06-18T10:00:00Z" },
			},
		});
		expect(result.success).toBe(true);
	});

	test("parses a non-arrival ping with null arrived_at", () => {
		const result = locationPingResponseSchema.safeParse({
			data: {
				arrived: false,
				location: null,
				order: { status: "tracking", arrived_at: null },
			},
		});
		expect(result.success).toBe(true);
	});

	test("keeps unknown order fields via passthrough", () => {
		const result = locationPingResponseSchema.safeParse({
			data: {
				arrived: false,
				location: {},
				order: { status: "tracking", id: "abc", user_id: "u1" },
			},
		});
		expect(result.success).toBe(true);
	});

	test("rejects a non-boolean arrived flag", () => {
		const result = locationPingResponseSchema.safeParse({
			data: {
				arrived: "yes",
				location: {},
				order: { status: "tracking" },
			},
		});
		expect(result.success).toBe(false);
	});

	test("rejects a missing order field", () => {
		const result = locationPingResponseSchema.safeParse({
			data: { arrived: true, location: {} },
		});
		expect(result.success).toBe(false);
	});
});
