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
		declineCompletion: vi.fn(),
		choosePaymentMethod: vi.fn(),
		markCashReceived: vi.fn(),
		cancelOrder: vi.fn(),
		resolveFeeObligation: vi.fn(),
		tagPaymentAsSmokeAuto: vi.fn(),
		getOrderDistance: vi.fn(),
		getLatestPaymentForOrder: vi.fn(),
		syncCardPaymentSnapshot: vi.fn(),
		updateCardPaymentStatus: vi.fn(),
		markOrderCompletedAfterCardPayment: vi.fn(),
		insertPaymentProviderEvent: vi.fn(),
		getProcessedProviderEventByHash: vi.fn(),
	},
}));

vi.mock("../paymob.adapter.js", () => ({
	paymobAdapter: {
		createCardSession: vi.fn(),
		verifyWebhook: vi.fn(),
		extractPaymentOutcome: vi.fn(),
	},
}));

vi.mock("../../../notifications/notifications.service.js", () => ({
	notificationsService: {
		sendPushToRecipient: vi.fn(),
	},
}));

vi.mock("../../orders.repository.js", () => ({
	ordersRepository: {
		getOrderById: vi.fn(),
	},
}));

// Programmable per-table behavior. Tests reassign these handlers in beforeEach.
type HandlerResult = { data: unknown; error: unknown };
type TableContext = {
	eq: Record<string, unknown>;
	method: "single" | "maybeSingle" | "select" | "update" | "insert";
	payload?: unknown;
};
type TableHandler = (context: TableContext) => HandlerResult;
const tableHandlers: Record<string, TableHandler> = {
	addresses: () => ({ data: null, error: null }),
	orders: () => ({ data: null, error: null }),
	order_quotes: () => ({ data: null, error: null }),
	user_fee_obligations: () => ({ data: null, error: null }),
};

// Each `from(table)` call returns a fresh chainable builder. The chain
// captures method calls (select/eq/limit/etc.) and `single()`/`maybeSingle()`
// return real Promises whose value comes from the current table handler.
function makeChain(table: string) {
	const state: TableContext = {
		eq: {},
		method: "select",
	};
	const settle = (method: TableContext["method"]): Promise<HandlerResult> => {
		state.method = method;
		return Promise.resolve(
			tableHandlers[table]?.(state) ?? { data: null, error: null },
		);
	};
	const builder: Record<string, unknown> = {
		select: () => {
			state.method = "select";
			return builder;
		},
		update: (payload: unknown) => {
			state.method = "update";
			state.payload = payload;
			return builder;
		},
		insert: (payload: unknown) => {
			state.method = "insert";
			state.payload = payload;
			return builder;
		},
		eq: (column: string, value: unknown) => {
			state.eq[column] = value;
			return builder;
		},
		is: () => builder,
		order: () => builder,
		limit: () => builder,
		maybeSingle: () => settle("maybeSingle"),
		single: () => settle("single"),
	};
	// The real Supabase query builder is a PromiseLike: awaiting it runs the
	// query. Defined off the object literal so the mock stays awaitable without
	// declaring a literal `then` member.
	// biome-ignore lint/suspicious/noThenProperty: intentional PromiseLike mock mirroring Supabase's awaitable query builder
	Object.defineProperty(builder, "then", { // NOSONAR intentional PromiseLike mock mirroring Supabase's awaitable query builder
		value: (
			resolve: (value: HandlerResult) => unknown,
			reject?: (reason: unknown) => unknown,
		) => settle(state.method).then(resolve, reject),
		enumerable: false,
	});
	return builder;
}
function buildSupabaseMock() {
	return { from: (table: string) => makeChain(table) };
}

vi.mock("../../../../shared/db/supabase.js", () => ({
	supabaseAdmin: buildSupabaseMock(),
}));

// ─── Imports under test (after mocks are registered) ────────────────────────

const repoModule = await import("../lifecycle.repository.js");
const { LifecycleService } = await import("../lifecycle.service.js");
const paymobModule = await import("../paymob.adapter.js");
const notificationsModule = await import(
	"../../../notifications/notifications.service.js"
);
const ordersModule = await import("../../orders.repository.js");

const repo = repoModule.lifecycleRepository as unknown as {
	submitOrder: ReturnType<typeof vi.fn>;
	orderAction: ReturnType<typeof vi.fn>;
	upsertLocation: ReturnType<typeof vi.fn>;
	submitQuote: ReturnType<typeof vi.fn>;
	acceptQuote: ReturnType<typeof vi.fn>;
	confirmCompletion: ReturnType<typeof vi.fn>;
	declineCompletion: ReturnType<typeof vi.fn>;
	choosePaymentMethod: ReturnType<typeof vi.fn>;
	markCashReceived: ReturnType<typeof vi.fn>;
	tagPaymentAsSmokeAuto: ReturnType<typeof vi.fn>;
	cancelOrder: ReturnType<typeof vi.fn>;
	getOrderDistance: ReturnType<typeof vi.fn>;
	getLatestPaymentForOrder: ReturnType<typeof vi.fn>;
	syncCardPaymentSnapshot: ReturnType<typeof vi.fn>;
	updateCardPaymentStatus: ReturnType<typeof vi.fn>;
	markOrderCompletedAfterCardPayment: ReturnType<typeof vi.fn>;
	insertPaymentProviderEvent: ReturnType<typeof vi.fn>;
	getProcessedProviderEventByHash: ReturnType<typeof vi.fn>;
};

const notifications = notificationsModule.notificationsService as unknown as {
	sendPushToRecipient: ReturnType<typeof vi.fn>;
};

const ordersRepository = ordersModule.ordersRepository as unknown as {
	getOrderById: ReturnType<typeof vi.fn>;
};

const paymobAdapter = paymobModule.paymobAdapter as unknown as {
	createCardSession: ReturnType<typeof vi.fn>;
	verifyWebhook: ReturnType<typeof vi.fn>;
	extractPaymentOutcome: ReturnType<typeof vi.fn>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setAddressesHandler(handler: TableHandler) {
	tableHandlers.addresses = handler;
}
function setOrdersHandlerSequence(...payloads: Array<HandlerResult>) {
	// For upsertLocation we need TWO calls (pre-read arrived_at, post-read row).
	// Each subsequent .single() returns the next payload in the sequence.
	let i = 0;
	tableHandlers.orders = (context) => {
		if (context.method !== "single" && context.method !== "maybeSingle") {
			return { data: null, error: null };
		}
		const payload = payloads[Math.min(i, payloads.length - 1)] ?? {
			data: null,
			error: null,
		};
		i += 1;
		return payload;
	};
}

function setOrderQuotesHandlerSequence(...payloads: Array<HandlerResult>) {
	let i = 0;
	tableHandlers.order_quotes = (context) => {
		if (context.method !== "single" && context.method !== "maybeSingle") {
			return { data: null, error: null };
		}
		const payload = payloads[Math.min(i, payloads.length - 1)] ?? {
			data: null,
			error: null,
		};
		i += 1;
		return payload;
	};
}

function setUserFeeObligationsHandler(handler: TableHandler) {
	tableHandlers.user_fee_obligations = handler;
}

const ORIGINAL_SMOKE_ENV = process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE;

beforeEach(() => {
	// Reset all repo mocks
	for (const m of Object.values(repo)) {
		m.mockReset();
	}
	notifications.sendPushToRecipient.mockReset();
	ordersRepository.getOrderById.mockReset();
	paymobAdapter.createCardSession.mockReset();
	paymobAdapter.verifyWebhook.mockReset();
	paymobAdapter.extractPaymentOutcome.mockReset();
	// Restore env baseline (smoke ON by default — anything except 'false')
	delete process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE;
	// Reset table handlers
	setAddressesHandler(() => ({ data: null, error: null }));
	tableHandlers.orders = () => ({ data: null, error: null });
	tableHandlers.order_quotes = () => ({ data: null, error: null });
	tableHandlers.user_fee_obligations = () => ({ data: null, error: null });
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
		let activeLookupCalled = false;
		setAddressesHandler((context) => {
			if (context.eq.user_id === "user-1" && context.eq.is_active === true) {
				activeLookupCalled = true;
				return { data: null, error: null };
			}
			if (
				context.eq.id === explicitAddressId &&
				context.eq.user_id === "user-1"
			) {
				return {
					data: {
						id: explicitAddressId,
						latitude: 30.0444,
						longitude: 31.2357,
					},
					error: null,
				};
			}
			if (context.eq.technician_id === "tech-1") {
				return {
					data: [
						{
							id: "tech-addr-1",
							latitude: 30.0444,
							longitude: 31.2357,
							is_active: true,
							created_at: "2026-06-01T00:00:00.000Z",
						},
					],
					error: null,
				};
			}
			return { data: null, error: null };
		});
		repo.submitOrder.mockResolvedValue({ id: "order-1", technician_id: "tech-1" });
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-1",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		await service.submitOrder("user-1", {
			technician_id: "tech-1",
			service_id: "svc-1",
			scheduled_date: "2026-06-01",
			scheduled_start_at: "2026-06-01T08:00:00+03:00",
			payment_method: "card",
			destination_address_id: explicitAddressId,
		});

		expect(activeLookupCalled).toBe(false);
		expect(repo.submitOrder).toHaveBeenCalledTimes(1);
		const firstCall = repo.submitOrder.mock.calls[0];
		expect(firstCall?.[0]).toMatchObject({
			userId: "user-1",
			technicianId: "tech-1",
			serviceId: "svc-1",
			destinationAddressId: explicitAddressId,
			paymentMethod: "card",
			inspectionFee: 100,
			inspectionDistanceKm: 0,
			scheduledDate: "2026-06-01",
		});
		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "technician",
			recipientId: "tech-1",
			type: "order_submitted",
			title: "New service request",
			body: "Sarah Ali sent a new booking request.",
			senderName: "Sarah Ali",
			orderId: "order-1",
			viewerRole: "technician",
		});
	});

	it("resolves user's single active address when destination_address_id omitted", async () => {
		const service = new LifecycleService();
		const resolvedId = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
		setAddressesHandler((context) => {
			if (context.eq.user_id === "user-2" && context.eq.is_active === true) {
				return { data: { id: resolvedId }, error: null };
			}
			if (context.eq.id === resolvedId && context.eq.user_id === "user-2") {
				return {
					data: {
						id: resolvedId,
						latitude: 30.0444,
						longitude: 31.2357,
					},
					error: null,
				};
			}
			if (context.eq.technician_id === "tech-2") {
				return {
					data: [
						{
							id: "tech-addr-2",
							latitude: 30.0444,
							longitude: 31.2357,
							is_active: true,
							created_at: "2026-06-02T00:00:00.000Z",
						},
					],
					error: null,
				};
			}
			return { data: null, error: null };
		});
		repo.submitOrder.mockResolvedValue({ id: "order-2" });
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-2",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		await service.submitOrder("user-2", {
			technician_id: "tech-2",
			service_id: "svc-2",
			scheduled_date: "2026-06-02",
			scheduled_start_at: "2026-06-02T11:00:00+03:00",
			payment_method: "cash",
		});

		expect(repo.submitOrder).toHaveBeenCalledTimes(1);
		const firstCall = repo.submitOrder.mock.calls[0];
		expect(
			(firstCall?.[0] as { destinationAddressId?: string })
				.destinationAddressId,
		).toBe(resolvedId);
		expect(
			(firstCall?.[0] as { inspectionFee?: number }).inspectionFee,
		).toBe(100);
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
				scheduled_start_at: "2026-06-03T14:00:00+03:00",
				payment_method: "cash",
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
				payment_method: "cash",
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
				payment_method: "cash",
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

describe("LifecycleService.previewInspectionFee", () => {
	it("returns the inspection fee snapshot for valid user and technician addresses", async () => {
		const service = new LifecycleService();
		setAddressesHandler((context) => {
			if (
				context.eq.id === "addr-preview" &&
				context.eq.user_id === "user-preview"
			) {
				return {
					data: {
						id: "addr-preview",
						latitude: 30.0444,
						longitude: 31.2357,
					},
					error: null,
				};
			}
			if (context.eq.technician_id === "tech-preview") {
				return {
					data: [
						{
							id: "tech-addr-preview",
							latitude: 30.0561,
							longitude: 31.2394,
							is_active: true,
							created_at: "2026-06-03T00:00:00.000Z",
						},
					],
					error: null,
				};
			}
			return { data: null, error: null };
		});

		const preview = await service.previewInspectionFee(
			"user-preview",
			"tech-preview",
			"addr-preview",
		);

		expect(preview.inspection_fee).toBeGreaterThan(0);
		expect(preview.inspection_distance_km).toBeGreaterThan(0);
	});

	it("throws a pricing token when pricing coordinates are unavailable", async () => {
		const service = new LifecycleService();
		setAddressesHandler((context) => {
			if (
				context.eq.id === "addr-missing" &&
				context.eq.user_id === "user-missing"
			) {
				return {
					data: {
						id: "addr-missing",
						latitude: null,
						longitude: 31.2357,
					},
					error: null,
				};
			}
			if (context.eq.technician_id === "tech-missing") {
				return {
					data: [
						{
							id: "tech-addr-missing",
							latitude: 30.0561,
							longitude: 31.2394,
							is_active: true,
							created_at: "2026-06-03T00:00:00.000Z",
						},
					],
					error: null,
				};
			}
			return { data: null, error: null };
		});

		let caught: unknown;
		try {
			await service.previewInspectionFee(
				"user-missing",
				"tech-missing",
				"addr-missing",
			);
		} catch (error) {
			caught = error;
		}

		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).status).toBe(400);
		expect((caught as AppError).opts.token).toBe(
			"inspection_fee_pricing_unavailable",
		);
	});

	it("rejects preview when the destination address is not owned by the user", async () => {
		const service = new LifecycleService();
		setAddressesHandler((context) => {
			if (
				context.eq.id === "addr-foreign" &&
				context.eq.user_id === "user-preview"
			) {
				return { data: null, error: null };
			}
			if (context.eq.technician_id === "tech-preview") {
				return {
					data: [
						{
							id: "tech-addr-preview",
							latitude: 30.0561,
							longitude: 31.2394,
							is_active: true,
							created_at: "2026-06-03T00:00:00.000Z",
						},
					],
					error: null,
				};
			}
			return { data: null, error: null };
		});

		let caught: unknown;
		try {
			await service.previewInspectionFee(
				"user-preview",
				"tech-preview",
				"addr-foreign",
			);
		} catch (error) {
			caught = error;
		}

		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).status).toBe(403);
		expect((caught as AppError).opts.token).toBe(
			"destination_address_not_owned_by_user",
		);
	});
});

// ─── confirmCompletion smoke branches ────────────────────────────────────────

describe("LifecycleService.confirmCompletion (card-only smoke auto-finalize)", () => {
	const orderAwaitingPayment = {
		id: "order-x",
		user_id: "user-x",
		technician_id: "tech-x",
		status: "awaiting_payment",
		payment_method: "card",
		final_price: 1000,
	};
	const orderCompleted = { ...orderAwaitingPayment, status: "completed" };
	const orderInProgress = { ...orderAwaitingPayment, status: "in_progress" };
	const orderCashCompleted = {
		id: "order-c",
		user_id: "user-c",
		technician_id: "tech-c",
		status: "completed",
		payment_method: "cash",
		final_price: 1000,
	};

	it("smoke ON + card awaiting_payment → snapshot → tag → mark paid → complete in order", async () => {
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderAwaitingPayment);
		repo.syncCardPaymentSnapshot.mockResolvedValue({
			id: "pay-x",
			order_id: "order-x",
		});
		repo.tagPaymentAsSmokeAuto.mockResolvedValue(undefined);
		repo.updateCardPaymentStatus.mockResolvedValue({ id: "pay-x" });
		repo.markOrderCompletedAfterCardPayment.mockResolvedValue(orderCompleted);
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-x",
			user_id: "user-x",
			technician_id: "tech-x",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		const result = await service.confirmCompletion("order-x", "user-x", "user");

		expect(repo.syncCardPaymentSnapshot).toHaveBeenCalledWith(
			expect.objectContaining({ orderId: "order-x", provider: "paymob" }),
		);
		expect(repo.tagPaymentAsSmokeAuto).toHaveBeenCalledWith("order-x");
		expect(repo.updateCardPaymentStatus).toHaveBeenCalledWith(
			expect.objectContaining({ paymentId: "pay-x", status: "paid" }),
		);
		expect(repo.markOrderCompletedAfterCardPayment).toHaveBeenCalledWith(
			"order-x",
		);
		// No legacy cash-selection / cash-received calls.
		expect(repo.choosePaymentMethod).not.toHaveBeenCalled();
		expect(repo.markCashReceived).not.toHaveBeenCalled();

		// Ordering: snapshot < tag < update < complete
		const snapOrder = repo.syncCardPaymentSnapshot.mock.invocationCallOrder[0];
		const tagOrder = repo.tagPaymentAsSmokeAuto.mock.invocationCallOrder[0];
		const updOrder = repo.updateCardPaymentStatus.mock.invocationCallOrder[0];
		const compOrder =
			repo.markOrderCompletedAfterCardPayment.mock.invocationCallOrder[0];
		expect(snapOrder).toBeLessThan(tagOrder as number);
		expect(tagOrder).toBeLessThan(updOrder as number);
		expect(updOrder).toBeLessThan(compOrder as number);

		expect(result).toEqual(orderCompleted);
	});

	it("cash order auto-completes via the trigger → no smoke calls", async () => {
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderCashCompleted);
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-c",
			user_id: "user-c",
			technician_id: "tech-c",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		const result = await service.confirmCompletion("order-c", "user-c", "user");

		expect(repo.syncCardPaymentSnapshot).not.toHaveBeenCalled();
		expect(repo.markOrderCompletedAfterCardPayment).not.toHaveBeenCalled();
		expect(result).toEqual(orderCashCompleted);
	});

	it("smoke OFF (env=`false`) → no smoke calls, returns RPC result as-is", async () => {
		process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE = "false";
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderAwaitingPayment);
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-x",
			user_id: "user-x",
			technician_id: "tech-x",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		const result = await service.confirmCompletion("order-x", "user-x", "user");

		expect(repo.syncCardPaymentSnapshot).not.toHaveBeenCalled();
		expect(repo.tagPaymentAsSmokeAuto).not.toHaveBeenCalled();
		expect(repo.markOrderCompletedAfterCardPayment).not.toHaveBeenCalled();
		expect(result).toEqual(orderAwaitingPayment);
	});

	it("smoke ON but RPC returns in_progress (only one party confirmed) → no smoke", async () => {
		const service = new LifecycleService();
		repo.confirmCompletion.mockResolvedValue(orderInProgress);
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-x",
			user_id: "user-x",
			technician_id: "tech-x",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		const result = await service.confirmCompletion("order-x", "user-x", "user");

		expect(repo.syncCardPaymentSnapshot).not.toHaveBeenCalled();
		expect(repo.tagPaymentAsSmokeAuto).not.toHaveBeenCalled();
		expect(repo.markOrderCompletedAfterCardPayment).not.toHaveBeenCalled();
		expect(result).toEqual(orderInProgress);
	});
});

describe("LifecycleService.createCardSession", () => {
	it("creates a card payment snapshot and returns a Paymob session", async () => {
		const service = new LifecycleService();
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-card",
			user_id: "user-card",
			technician_id: "tech-card",
			status: "awaiting_payment",
			final_price: 1000,
			payment_method: "card",
			user_name: "Sarah Ali",
			user_phone: "+201000000000",
			user_address: "12 Road, Cairo",
		});
		repo.getLatestPaymentForOrder.mockResolvedValue({
			id: "pay-1",
			status: "created",
		});
		repo.syncCardPaymentSnapshot.mockResolvedValue({
			id: "pay-1",
			order_id: "order-card",
		});
		paymobAdapter.createCardSession.mockResolvedValue({
			provider: "paymob",
			paymentId: "pay-1",
			clientSecret: "secret",
			publicKey: "pk",
			expiresAt: "2026-01-15T12:00:00.000Z",
			checkoutUrl: "https://example.com/pay",
		});

		const session = await service.createCardSession("order-card", "user-card");

		// Method is chosen upfront; card-session must not re-select it.
		expect(repo.choosePaymentMethod).not.toHaveBeenCalled();
		expect(repo.syncCardPaymentSnapshot).toHaveBeenCalledWith(
			expect.objectContaining({
				orderId: "order-card",
				grossAmount: 1000,
				platformFeePercent: 5,
				platformFeeAmount: 50,
				technicianNetAmount: 950,
				provider: "paymob",
				currency: "EGP",
			}),
		);
		expect(paymobAdapter.createCardSession).toHaveBeenCalledWith(
			expect.objectContaining({
				paymentId: "pay-1",
				merchantOrderId: expect.stringMatching(/^fixit-payment-pay-1-\d+$/),
			}),
		);
		expect(session.checkoutUrl).toBe("https://example.com/pay");
	});

	it("rejects a cash order (order_not_card_payment)", async () => {
		const service = new LifecycleService();
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-card",
			user_id: "user-card",
			technician_id: "tech-card",
			status: "awaiting_payment",
			final_price: 1000,
			payment_method: "cash",
		});

		await expect(
			service.createCardSession("order-card", "user-card"),
		).rejects.toMatchObject({ opts: { token: "order_not_card_payment" } });
		expect(repo.syncCardPaymentSnapshot).not.toHaveBeenCalled();
	});

	it("rejects orders that are not awaiting payment", async () => {
		const service = new LifecycleService();
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-card",
			user_id: "user-card",
			technician_id: "tech-card",
			status: "in_progress",
			final_price: 1000,
			payment_method: "card",
		});

		await expect(
			service.createCardSession("order-card", "user-card"),
		).rejects.toBeInstanceOf(AppError);
		expect(repo.syncCardPaymentSnapshot).not.toHaveBeenCalled();
	});
});

describe("LifecycleService.handlePaymobWebhook", () => {
	it("returns duplicate=true when the payload hash was already processed", async () => {
		const service = new LifecycleService();
		paymobAdapter.extractPaymentOutcome.mockReturnValue({
			provider: "paymob",
			externalEventId: "event-1",
			paymentId: "pay-1",
			providerPaymentId: "provider-1",
			providerTransactionId: "txn-1",
			status: "paid",
			success: true,
			raw: { ok: true },
		});
		repo.getProcessedProviderEventByHash.mockResolvedValue(true);

		const result = await service.handlePaymobWebhook(
			{ id: "event-1" },
			{ "x-paymob-signature": "sig" },
		);

		expect(paymobAdapter.verifyWebhook).toHaveBeenCalled();
		expect(result).toEqual({ accepted: true, duplicate: true });
		expect(repo.updateCardPaymentStatus).not.toHaveBeenCalled();
	});

	it("marks the payment paid and completes the order on successful webhook", async () => {
		const service = new LifecycleService();
		paymobAdapter.extractPaymentOutcome.mockReturnValue({
			provider: "paymob",
			externalEventId: "event-2",
			paymentId: "pay-2",
			providerPaymentId: "provider-2",
			providerTransactionId: "txn-2",
			status: "paid",
			success: true,
			raw: { success: true },
		});
		repo.getProcessedProviderEventByHash.mockResolvedValue(false);
		repo.updateCardPaymentStatus.mockResolvedValue({
			id: "pay-2",
			order_id: "order-2",
		});
		repo.markOrderCompletedAfterCardPayment.mockResolvedValue({
			id: "order-2",
			status: "completed",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-2",
			user_id: "user-2",
			technician_id: "tech-2",
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		const result = await service.handlePaymobWebhook(
			{ id: "event-2", success: true },
			{ "x-paymob-signature": "sig" },
		);

		expect(repo.updateCardPaymentStatus).toHaveBeenCalledWith(
			expect.objectContaining({
				paymentId: "pay-2",
				status: "paid",
				providerTransactionId: "txn-2",
			}),
		);
		expect(repo.markOrderCompletedAfterCardPayment).toHaveBeenCalledWith(
			"order-2",
		);
		expect(repo.insertPaymentProviderEvent).toHaveBeenCalled();
		expect(result).toEqual({ accepted: true, duplicate: false });
	});
});

// ─── upsertLocation arrived-flag derivation ─────────────────────────────────

describe("LifecycleService.upsertLocation (arrived flag)", () => {
	it("flips arrived=true when pre-read arrived_at is null and post-read is non-null", async () => {
		const service = new LifecycleService();
		setOrdersHandlerSequence(
			{ data: { arrived_at: null }, error: null },
		);
		repo.upsertLocation.mockResolvedValue({ id: "loc-1" });
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-loc",
			user_id: "user-loc",
			arrived_at: "2026-05-15T12:00:00Z",
			technician_name: "Omar Hassan",
		});

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
			body: "Omar Hassan has arrived at the destination.",
			senderName: "Omar Hassan",
			senderImageUrl: undefined,
			orderId: "order-loc",
			viewerRole: "user",
		});
	});

	it("keeps arrived=false when both reads already carry a non-null arrived_at", async () => {
		const service = new LifecycleService();
		const existing = "2026-05-15T11:00:00Z";
		setOrdersHandlerSequence({ data: { arrived_at: existing }, error: null });
		repo.upsertLocation.mockResolvedValue({ id: "loc-2" });
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-loc-2",
			arrived_at: existing,
			user_id: "user-loc-2",
			technician_name: "Omar Hassan",
		});

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
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-accept",
			user_id: "user-1",
			technician_name: "Omar Hassan",
		});

		await service.techAccept("order-accept", "tech-1");

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			type: "order_accepted",
			title: "Booking accepted",
			body: "Omar Hassan accepted your booking request.",
			senderName: "Omar Hassan",
			senderImageUrl: undefined,
			orderId: "order-accept",
			viewerRole: "user",
		});
	});

	it("notifies the user when the technician starts inspection", async () => {
		const service = new LifecycleService();
		repo.orderAction.mockResolvedValue({
			id: "order-inspect-start",
			user_id: "user-1",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-inspect-start",
			user_id: "user-1",
			technician_name: "Omar Hassan",
		});

		await service.techStartInspection("order-inspect-start", "tech-1");

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			type: "inspection_started",
			title: "Inspection started",
			body: "Omar Hassan started the on-site inspection.",
			senderName: "Omar Hassan",
			senderImageUrl: undefined,
			orderId: "order-inspect-start",
			viewerRole: "user",
		});
	});

	it("notifies the user when the technician finishes inspection", async () => {
		const service = new LifecycleService();
		repo.orderAction.mockResolvedValue({
			id: "order-inspect-finish",
			user_id: "user-1",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-inspect-finish",
			user_id: "user-1",
			technician_name: "Omar Hassan",
		});

		await service.techFinishInspection("order-inspect-finish", "tech-1");

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			type: "inspection_finished",
			title: "Inspection finished",
			body: "Omar Hassan finished the inspection. Final pricing can now be reviewed.",
			senderName: "Omar Hassan",
			senderImageUrl: undefined,
			orderId: "order-inspect-finish",
			viewerRole: "user",
		});
	});

	it("notifies the counterparty when a quote is submitted", async () => {
		const service = new LifecycleService();
		repo.submitQuote.mockResolvedValue({
			id: "quote-1",
			order_id: "order-quote",
			amount: 350,
			proposed_by: "technician",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-quote",
			user_id: "user-1",
			technician_id: "tech-1",
			technician_name: "Omar Hassan",
		});

		await service.submitQuote("order-quote", "tech-1", "technician", 350);

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			type: "quote_submitted",
			title: "New quote received",
			body: "Omar Hassan sent a quote for 350 EGP.",
			senderName: "Omar Hassan",
			senderImageUrl: undefined,
			orderId: "order-quote",
			viewerRole: "user",
		});
	});

	it("notifies the proposer when a quote is accepted", async () => {
		const service = new LifecycleService();
		const orderUpdates: Array<unknown> = [];
		tableHandlers.orders = (context) => {
			if (context.method === "update") {
				orderUpdates.push(context.payload);
			}
			return { data: null, error: null };
		};
		setOrderQuotesHandlerSequence({
			data: {
				id: "quote-2",
				order_id: "order-quote-accept",
				amount: 500,
				proposed_by: "technician",
			},
			error: null,
		});
		repo.acceptQuote.mockResolvedValue({
			id: "order-quote-accept",
			user_id: "user-1",
			technician_id: "tech-1",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-quote-accept",
			user_id: "user-1",
			technician_id: "tech-1",
			inspection_fee: 150,
			user_name: "Sarah Ali",
			technician_name: "Omar Hassan",
		});

		await service.acceptQuote("quote-2", "user-1", "user");

		expect(orderUpdates).toContainEqual({
			work_price: 500,
			final_price: 650,
		});

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "technician",
			recipientId: "tech-1",
			type: "quote_accepted",
			title: "Quote accepted",
			body: "Sarah Ali accepted your quote for 500 EGP.",
			senderName: "Sarah Ali",
			orderId: "order-quote-accept",
			viewerRole: "technician",
		});
	});

	it("notifies the counterparty when an order is cancelled", async () => {
		const service = new LifecycleService();
		const obligationUpdates: Array<unknown> = [];
		setUserFeeObligationsHandler((context) => {
			if (context.method === "maybeSingle") {
				return { data: { id: "obligation-1" }, error: null };
			}
			if (context.method === "update") {
				obligationUpdates.push(context.payload);
			}
			return { data: null, error: null };
		});
		repo.cancelOrder.mockResolvedValue({
			id: "order-cancel",
			user_id: "user-1",
			technician_id: "tech-1",
			status: "cancelled_with_fee",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-cancel",
			user_id: "user-1",
			technician_id: "tech-1",
			inspection_fee: 150,
			technician_name: "Omar Hassan",
			user_name: "Sarah Ali",
		});

		await service.cancelOrder("order-cancel", "tech-1", "technician", "Emergency");

		expect(obligationUpdates).toContainEqual({ amount: 150 });

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "user",
			recipientId: "user-1",
			type: "order_cancelled",
			title: "Order cancelled",
			body: "Omar Hassan cancelled the booking. Reason: Emergency.",
			senderName: "Omar Hassan",
			senderImageUrl: undefined,
			orderId: "order-cancel",
			viewerRole: "user",
		});
	});

	it("notifies the counterparty when completion is confirmed", async () => {
		const service = new LifecycleService();
		process.env.LIFECYCLE_SMOKE_AUTO_COMPLETE = "false";
		repo.confirmCompletion.mockResolvedValue({
			id: "order-confirm",
			user_id: "user-1",
			technician_id: "tech-1",
			status: "in_progress",
		});
		ordersRepository.getOrderById.mockResolvedValue({
			id: "order-confirm",
			user_id: "user-1",
			technician_id: "tech-1",
			technician_name: "Omar Hassan",
			user_name: "Sarah Ali",
		});

		await service.confirmCompletion("order-confirm", "user-1", "user");

		expect(notifications.sendPushToRecipient).toHaveBeenCalledWith({
			recipientRole: "technician",
			recipientId: "tech-1",
			type: "completion_confirmed",
			title: "Completion confirmed",
			body: "Sarah Ali confirmed the booking is complete.",
			senderName: "Sarah Ali",
			orderId: "order-confirm",
			viewerRole: "technician",
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
