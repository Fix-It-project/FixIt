/**
 * Unit tests for LifecycleService — Phase 2 Plan 02-02 Task 3.
 *
 * The service is tested in isolation with a mocked `lifecycleRepository`
 * (so no real RPC calls) and a mocked `supabaseAdmin` (so `addresses`
 * lookups + `orders` re-reads can be scripted per-test).
 *
 * Covered cases (the eight required by the plan):
 *   1. submitOrder with explicit destination_address_id → addresses NOT queried
 *   2. submitOrder without it, user has 1 active address → resolved id is used
 *   3. submitOrder without it, user has 0 active addresses → AppError(no_active_address)
 *   4. confirmCompletion smoke ON, RPC returns awaiting_payment → full smoke sequence runs in order
 *   5. confirmCompletion smoke OFF (env=`'false'`) → no smoke calls
 *   6. confirmCompletion smoke ON but RPC returns in_progress → no smoke calls
 *   7. upsertLocation arrived flag flips from null → non-null
 *   8. upsertLocation arrived flag stays false when both reads carry a non-null arrived_at
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../../shared/errors/index.js";

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock("../lifecycle.repository.js", () => ({
	lifecycleRepository: {
		submitOrder: vi.fn(),
		orderAction: vi.fn(),
		upsertLocation: vi.fn(),
		submitQuote: vi.fn(),
		acceptQuote: vi.fn(),
		confirmCompletion: vi.fn(),
		choosePaymentMethod: vi.fn(),
		markCashReceived: vi.fn(),
		cancelOrder: vi.fn(),
		resolveFeeObligation: vi.fn(),
		tagPaymentAsSmokeAuto: vi.fn(),
		getOrderDistance: vi.fn(),
	},
}));

vi.mock("../../../notifications/notifications.service.js", () => ({
	notificationsService: {
		sendPushToRecipient: vi.fn(),
	},
}));

// Programmable per-table behavior. Tests reassign these handlers in beforeEach.
type HandlerResult = { data: unknown; error: unknown };
type TableHandler = () => HandlerResult;
const tableHandlers: Record<string, TableHandler> = {
	addresses: () => ({ data: null, error: null }),
	orders: () => ({ data: null, error: null }),
	order_quotes: () => ({ data: null, error: null }),
};

function buildSupabaseMock() {
	// Each `from(table)` call returns a fresh chainable builder. The chain
	// captures method calls (select/eq/limit/etc.) and `single()`/`maybeSingle()`
	// return real Promises whose value comes from the current table handler.
	function makeChain(table: string) {
		const settle = (): Promise<HandlerResult> =>
			Promise.resolve(tableHandlers[table]?.() ?? { data: null, error: null });
		const builder: Record<string, unknown> = {
			select: () => builder,
			eq: () => builder,
			is: () => builder,
			limit: () => builder,
			maybeSingle: () => settle(),
			single: () => settle(),
		};
		return builder;
	}
	return { from: (table: string) => makeChain(table) };
}

vi.mock("../../../../shared/db/supabase.js", () => ({
	supabaseAdmin: buildSupabaseMock(),
}));

// ─── Imports under test (after mocks are registered) ────────────────────────

const repoModule = await import("../lifecycle.repository.js");
const { LifecycleService } = await import("../lifecycle.service.js");
const notificationsModule = await import(
	"../../../notifications/notifications.service.js"
);

const repo = repoModule.lifecycleRepository as unknown as {
	submitOrder: ReturnType<typeof vi.fn>;
	orderAction: ReturnType<typeof vi.fn>;
	upsertLocation: ReturnType<typeof vi.fn>;
	confirmCompletion: ReturnType<typeof vi.fn>;
	choosePaymentMethod: ReturnType<typeof vi.fn>;
	markCashReceived: ReturnType<typeof vi.fn>;
	tagPaymentAsSmokeAuto: ReturnType<typeof vi.fn>;
	cancelOrder: ReturnType<typeof vi.fn>;
	getOrderDistance: ReturnType<typeof vi.fn>;
};

const notifications = notificationsModule.notificationsService as unknown as {
	sendPushToRecipient: ReturnType<typeof vi.fn>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setAddressesHandler(handler: TableHandler) {
	tableHandlers.addresses = handler;
}
function setOrdersHandlerSequence(...payloads: Array<HandlerResult>) {
	// For upsertLocation we need TWO calls (pre-read arrived_at, post-read row).
	// Each subsequent .single() returns the next payload in the sequence.
	let i = 0;
	tableHandlers.orders = () => {
		const payload = payloads[Math.min(i, payloads.length - 1)] ?? {
			data: null,
			error: null,
		};
		i += 1;
		return payload;
	};
}

const ORIGINAL_SMOKE_ENV = process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE;

beforeEach(() => {
	// Reset all repo mocks
	for (const m of Object.values(repo)) {
		m.mockReset();
	}
	notifications.sendPushToRecipient.mockReset();
	// Restore env baseline (smoke ON by default — anything except 'false')
	delete process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE;
	// Reset table handlers
	setAddressesHandler(() => ({ data: null, error: null }));
	tableHandlers.orders = () => ({ data: null, error: null });
});

afterEach(() => {
	if (ORIGINAL_SMOKE_ENV === undefined) {
		delete process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE;
	} else {
		process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE = ORIGINAL_SMOKE_ENV;
	}
});

// ─── submitOrder ─────────────────────────────────────────────────────────────

describe("LifecycleService.submitOrder", () => {
	it("uses explicit destination_address_id when provided (addresses NOT queried)", async () => {
		const service = new LifecycleService();
		const explicitAddressId = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
		// If the service queries addresses anyway, the handler would still match;
		// we assert the value passed to repo.submitOrder is the explicit one.
		let addressesCalled = false;
		setAddressesHandler(() => {
			addressesCalled = true;
			return { data: { id: "should-not-be-used" }, error: null };
		});
		repo.submitOrder.mockResolvedValue({ id: "order-1", technician_id: "tech-1" });

		await service.submitOrder("user-1", {
			technician_id: "tech-1",
			service_id: "svc-1",
			scheduled_date: "2026-06-01",
			scheduled_start_at: "2026-06-01T08:00:00+03:00",
			destination_address_id: explicitAddressId,
		});

		expect(addressesCalled).toBe(false);
		expect(repo.submitOrder).toHaveBeenCalledTimes(1);
		const firstCall = repo.submitOrder.mock.calls[0];
		expect(firstCall?.[0]).toMatchObject({
			userId: "user-1",
			technicianId: "tech-1",
			serviceId: "svc-1",
			destinationAddressId: explicitAddressId,
			scheduledDate: "2026-06-01",
		});
		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "technician",
			recipientId: "tech-1",
			type: "order_submitted",
			title: "New service request",
			body: "A new booking is waiting for your review.",
			orderId: "order-1",
			viewerRole: "technician",
		});
	});

	it("resolves user's single active address when destination_address_id omitted", async () => {
		const service = new LifecycleService();
		const resolvedId = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
		setAddressesHandler(() => ({ data: { id: resolvedId }, error: null }));
		repo.submitOrder.mockResolvedValue({ id: "order-2" });

		await service.submitOrder("user-2", {
			technician_id: "tech-2",
			service_id: "svc-2",
			scheduled_date: "2026-06-02",
			scheduled_start_at: "2026-06-02T10:00:00+03:00",
		});

		expect(repo.submitOrder).toHaveBeenCalledTimes(1);
		const firstCall = repo.submitOrder.mock.calls[0];
		expect(
			(firstCall?.[0] as { destinationAddressId?: string })
				.destinationAddressId,
		).toBe(resolvedId);
	});

	it("throws AppError(no_active_address) when user has 0 active addresses", async () => {
		const service = new LifecycleService();
		setAddressesHandler(() => ({ data: null, error: null }));

		let caught: unknown;
		try {
			await service.submitOrder("user-3", {
				technician_id: "tech-3",
				service_id: "svc-3",
				scheduled_date: "2026-06-03",
				scheduled_start_at: "2026-06-03T12:00:00+03:00",
			});
		} catch (err) {
			caught = err;
		}

		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).status).toBe(400);
		expect((caught as AppError).message).toContain("no_active_address");
		expect(repo.submitOrder).not.toHaveBeenCalled();
	});

	it("throws AppError(scheduled_start_at_required) when start time is missing", async () => {
		const service = new LifecycleService();

		let caught: unknown;
		try {
			await service.submitOrder("user-4", {
				technician_id: "tech-4",
				service_id: "svc-4",
				scheduled_date: "2026-06-04",
				// runtime guard coverage; API schema also rejects this upstream
				scheduled_start_at: undefined as unknown as string,
			});
		} catch (err) {
			caught = err;
		}

		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).status).toBe(400);
		expect((caught as AppError).message).toContain(
			"scheduled_start_at_required",
		);
		expect(repo.submitOrder).not.toHaveBeenCalled();
	});

	it("throws AppError(invalid_scheduled_slot) for non-fixed-hour start", async () => {
		const service = new LifecycleService();

		let caught: unknown;
		try {
			await service.submitOrder("user-5", {
				technician_id: "tech-5",
				service_id: "svc-5",
				scheduled_date: "2026-06-05",
				scheduled_start_at: "2026-06-05T09:00:00+03:00",
			});
		} catch (err) {
			caught = err;
		}

		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).status).toBe(400);
		expect((caught as AppError).message).toContain("invalid_scheduled_slot");
		expect(repo.submitOrder).not.toHaveBeenCalled();
	});
});

// ─── confirmCompletion smoke branches ────────────────────────────────────────

describe("LifecycleService.confirmCompletion (smoke auto-finalize)", () => {
	const orderAwaitingPayment = {
		id: "order-x",
		user_id: "user-x",
		technician_id: "tech-x",
		status: "awaiting_payment",
	};
	const orderCompleted = { ...orderAwaitingPayment, status: "completed" };
	const orderInProgress = { ...orderAwaitingPayment, status: "in_progress" };

	it("smoke ON + status=awaiting_payment → choose → tag → mark in order", async () => {
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderAwaitingPayment);
		repo.choosePaymentMethod.mockResolvedValue(orderAwaitingPayment);
		repo.tagPaymentAsSmokeAuto.mockResolvedValue(undefined);
		repo.markCashReceived.mockResolvedValue(orderCompleted);

		const result = await service.confirmCompletion("order-x", "user-x", "user");

		expect(repo.choosePaymentMethod).toHaveBeenCalledWith({
			orderId: "order-x",
			userId: "user-x",
			method: "cash",
		});
		expect(repo.tagPaymentAsSmokeAuto).toHaveBeenCalledWith("order-x");
		expect(repo.markCashReceived).toHaveBeenCalledWith({
			orderId: "order-x",
			technicianId: "tech-x",
		});

		// Assert ordering: choose < tag < mark
		const chooseOrder = repo.choosePaymentMethod.mock.invocationCallOrder[0];
		const tagOrder = repo.tagPaymentAsSmokeAuto.mock.invocationCallOrder[0];
		const markOrder = repo.markCashReceived.mock.invocationCallOrder[0];
		expect(chooseOrder !== undefined).toBe(true);
		expect(tagOrder !== undefined).toBe(true);
		expect(markOrder !== undefined).toBe(true);
		expect(chooseOrder).toBeLessThan(tagOrder as number);
		expect(tagOrder).toBeLessThan(markOrder as number);

		expect(result).toEqual(orderCompleted);
	});

	it("smoke OFF (env=`false`) → no smoke calls, returns RPC result as-is", async () => {
		process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE = "false";
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderAwaitingPayment);

		const result = await service.confirmCompletion("order-x", "user-x", "user");

		expect(repo.choosePaymentMethod).not.toHaveBeenCalled();
		expect(repo.tagPaymentAsSmokeAuto).not.toHaveBeenCalled();
		expect(repo.markCashReceived).not.toHaveBeenCalled();
		expect(result).toEqual(orderAwaitingPayment);
	});

	it("smoke ON but RPC returns in_progress (only one party confirmed) → no smoke", async () => {
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderInProgress);

		const result = await service.confirmCompletion("order-x", "user-x", "user");

		expect(repo.choosePaymentMethod).not.toHaveBeenCalled();
		expect(repo.tagPaymentAsSmokeAuto).not.toHaveBeenCalled();
		expect(repo.markCashReceived).not.toHaveBeenCalled();
		expect(result).toEqual(orderInProgress);
	});
});

// ─── upsertLocation arrived-flag derivation ─────────────────────────────────

describe("LifecycleService.upsertLocation (arrived flag)", () => {
	it("flips arrived=true when pre-read arrived_at is null and post-read is non-null", async () => {
		const service = new LifecycleService();
		setOrdersHandlerSequence(
			{ data: { arrived_at: null }, error: null }, // pre-read
			{
				data: {
					id: "order-loc",
					user_id: "user-loc",
					arrived_at: "2026-05-15T12:00:00Z",
				},
				error: null,
			}, // post-read
		);
		repo.upsertLocation.mockResolvedValue({ id: "loc-1" });

		const result = await service.upsertLocation(
			"order-loc",
			"tech-l",
			30.05,
			31.23,
		);

		expect(result.arrived).toBe(true);
		expect(result.location).toEqual({ id: "loc-1" });
		expect(
			(result.order as unknown as { arrived_at: string | null }).arrived_at,
		).toBe("2026-05-15T12:00:00Z");
		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-loc",
			type: "technician_arrived",
			title: "Technician arrived",
			body: "Your technician has arrived at the destination.",
			orderId: "order-loc",
			viewerRole: "user",
		});
	});

	it("keeps arrived=false when both reads already carry a non-null arrived_at", async () => {
		const service = new LifecycleService();
		const existing = "2026-05-15T11:00:00Z";
		setOrdersHandlerSequence(
			{ data: { arrived_at: existing }, error: null },
			{ data: { id: "order-loc-2", arrived_at: existing }, error: null },
		);
		repo.upsertLocation.mockResolvedValue({ id: "loc-2" });

		const result = await service.upsertLocation(
			"order-loc-2",
			"tech-l",
			30.05,
			31.23,
		);

		expect(result.arrived).toBe(false);
		expect(notifications.sendPushToRecipient).not.toHaveBeenCalled();
	});
});

describe("LifecycleService order action notifications", () => {
	it("notifies the user after technician accepts an order", async () => {
		const service = new LifecycleService();
		repo.orderAction.mockResolvedValue({
			id: "order-accept",
			user_id: "user-1",
		});

		await service.techAccept("order-accept", "tech-1");

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			type: "order_accepted",
			title: "Booking accepted",
			body: "Your technician accepted the booking request.",
			orderId: "order-accept",
			viewerRole: "user",
		});
	});
});

// ─── getOrderDistance (Phase 4a Plan 04) ────────────────────────────────────

describe("LifecycleService.getOrderDistance", () => {
	it("returns ETA based on AVG_SPEED_KMH = 25 km/h (5 km → 12 min)", async () => {
		const service = new LifecycleService();
		repo.getOrderDistance.mockResolvedValue(5.0);

		const result = await service.getOrderDistance("order-d1");

		// 5 / 25 * 60 = 12
		expect(result).toEqual({
			distance_km: 5.0,
			eta_minutes: 12,
			within_geofence: false,
		});
		expect(repo.getOrderDistance).toHaveBeenCalledWith("order-d1");
	});

	it("flags within_geofence when distance <= 1.0 km (0.75 km)", async () => {
		const service = new LifecycleService();
		repo.getOrderDistance.mockResolvedValue(0.75);

		const result = await service.getOrderDistance("order-d2");

		// round(0.75 / 25 * 60) = round(1.8) = 2
		expect(result).toEqual({
			distance_km: 0.75,
			eta_minutes: 2,
			within_geofence: true,
		});
	});

	it("returns {null, null, false} when distance is null (no ping yet)", async () => {
		const service = new LifecycleService();
		repo.getOrderDistance.mockResolvedValue(null);

		const result = await service.getOrderDistance("order-d3");

		expect(result).toEqual({
			distance_km: null,
			eta_minutes: null,
			within_geofence: false,
		});
	});

	it("treats exactly 1.0 km as within geofence (inclusive bound)", async () => {
		const service = new LifecycleService();
		repo.getOrderDistance.mockResolvedValue(1.0);

		const result = await service.getOrderDistance("order-d4");

		// round(1.0 / 25 * 60) = round(2.4) = 2
		expect(result).toEqual({
			distance_km: 1.0,
			eta_minutes: 2,
			within_geofence: true,
		});
	});
});
