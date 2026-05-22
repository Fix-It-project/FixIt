import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../../../shared/errors/index.js";

// ─── Supabase mock (used by the getOrderDistance describe block at the bottom)
// Mocking only the supabase client lets the real LifecycleRepository class
// route through the real `mapLifecycleRpcError`, so the existing mapper tests
// remain unaffected.

type RpcResult = { data: unknown; error: unknown };
let rpcHandler: (fn: string, args: Record<string, unknown>) => RpcResult =
	() => ({
		data: null,
		error: null,
	});
const rpcSpy = vi.fn();

vi.mock("../../../../shared/db/supabase.js", () => ({
	supabaseAdmin: {
		rpc: (fn: string, args: Record<string, unknown>) => {
			rpcSpy(fn, args);
			return Promise.resolve(rpcHandler(fn, args));
		},
	},
}));

const { mapLifecycleRpcError, LifecycleRepository } = await import(
	"../lifecycle.repository.js"
);

/**
 * Exhaustive coverage of every P0001 code raised by
 * supabase/migrations/20260512000000_order_state_machine_phase1_lean.sql.
 *
 * The mapper is pure (no supabase mocking required). Each row asserts that
 * the matched code throws an `AppError` with the right HTTP status AND that
 * the machine-readable code string survives into `.message` so native
 * clients can continue to switch on it.
 */

type MappingRow = {
	code: string;
	expectedStatus: number;
};

const MAPPING: ReadonlyArray<MappingRow> = [
	// Submit-time guards
	{ code: "cannot_submit_order_unpaid_fee", expectedStatus: 409 },
	{ code: "destination_address_not_owned_by_user", expectedStatus: 403 },
	// Ownership / lookup
	{ code: "order_not_found", expectedStatus: 404 },
	{ code: "order_not_found_or_not_owner", expectedStatus: 404 },
	{ code: "not_owner", expectedStatus: 403 },
	// Bad input shapes
	{ code: "bad_actor_role", expectedStatus: 400 },
	{ code: "bad_payment_method", expectedStatus: 400 },
	{ code: "bad_status", expectedStatus: 400 },
	{ code: "bad_order_action", expectedStatus: 400 },
	// State-machine violations
	{ code: "invalid_transition", expectedStatus: 409 },
	{ code: "arrival_not_detected_yet", expectedStatus: 409 },
	{ code: "too_far_from_destination", expectedStatus: 409 },
	{ code: "location_updates_only_allowed_while_tracking", expectedStatus: 409 },
	{ code: "technician_already_has_active_order", expectedStatus: 409 },
	{ code: "technician_already_tracking_another_order", expectedStatus: 409 },
	{ code: "earlier_order_not_completed", expectedStatus: 409 },
	// Quote-flow guards
	{ code: "quote_not_found", expectedStatus: 404 },
	{ code: "quote_not_pending", expectedStatus: 409 },
	{ code: "cannot_accept_own_quote", expectedStatus: 400 },
	{ code: "cannot_cancel_from_status", expectedStatus: 400 },
	{ code: "wrong_actor_for_round", expectedStatus: 400 },
	{ code: "max_quote_rounds_reached", expectedStatus: 409 },
	// Completion / payment / fees
	{ code: "missing_final_price", expectedStatus: 409 },
	{ code: "no_cash_payment_pending", expectedStatus: 409 },
	{ code: "fee_not_unpaid", expectedStatus: 409 },
];

describe("mapLifecycleRpcError", () => {
	describe.each(MAPPING)('P0001 code "$code"', ({ code, expectedStatus }) => {
		it(`throws AppError with status ${expectedStatus} and message containing "${code}"`, () => {
			let caught: unknown;
			try {
				mapLifecycleRpcError({ code: "P0001", message: code });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(AppError);
			const appErr = caught as AppError;
			expect(appErr.status).toBe(expectedStatus);
			expect(appErr.message).toContain(code);
		});
	});

	it("preserves the HINT clause for too_far_from_destination", () => {
		let caught: unknown;
		try {
			mapLifecycleRpcError({
				code: "P0001",
				message: "too_far_from_destination",
				hint: "current distance 2.34 km",
			});
		} catch (err) {
			caught = err;
		}
		expect(caught).toBeInstanceOf(AppError);
		const appErr = caught as AppError;
		expect(appErr.status).toBe(409);
		expect(appErr.message).toContain("too_far_from_destination");
		expect(appErr.message).toContain("current distance 2.34 km");
	});

	it("rethrows unknown errors unchanged (NOT wrapped in AppError)", () => {
		const unknown = { code: "08000", message: "connection_failure" };
		let caught: unknown;
		try {
			mapLifecycleRpcError(unknown);
		} catch (err) {
			caught = err;
		}
		expect(caught).toBe(unknown);
		expect(caught).not.toBeInstanceOf(AppError);
	});

	it("disambiguates order_not_found_or_not_owner from order_not_found / not_owner", () => {
		// The compound code must NOT be intercepted by either substring branch.
		let caught: unknown;
		try {
			mapLifecycleRpcError({
				code: "P0001",
				message: "order_not_found_or_not_owner",
			});
		} catch (err) {
			caught = err;
		}
		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).message).toBe("order_not_found_or_not_owner");
		expect((caught as AppError).status).toBe(404);
	});
});

// ─── LifecycleRepository.getOrderDistance (Phase 4a Plan 04) ────────────────

describe("LifecycleRepository.getOrderDistance", () => {
	beforeEach(() => {
		rpcSpy.mockReset();
		rpcHandler = () => ({ data: null, error: null });
	});

	it("returns the numeric distance from fn_order_distance_km", async () => {
		rpcHandler = () => ({ data: 0.5, error: null });
		const repo = new LifecycleRepository();

		const result = await repo.getOrderDistance("order-1");

		expect(result).toBe(0.5);
		expect(rpcSpy).toHaveBeenCalledTimes(1);
		expect(rpcSpy).toHaveBeenCalledWith("fn_order_distance_km", {
			p_order_id: "order-1",
		});
	});

	it("returns null when fn_order_distance_km returns null (no location row yet)", async () => {
		rpcHandler = () => ({ data: null, error: null });
		const repo = new LifecycleRepository();

		const result = await repo.getOrderDistance("order-2");

		expect(result).toBeNull();
		expect(rpcSpy).toHaveBeenCalledWith("fn_order_distance_km", {
			p_order_id: "order-2",
		});
	});

	it("routes rpc errors through mapLifecycleRpcError (order_not_found → 404 AppError)", async () => {
		rpcHandler = () => ({
			data: null,
			error: { code: "P0001", message: "order_not_found" },
		});
		const repo = new LifecycleRepository();

		let caught: unknown;
		try {
			await repo.getOrderDistance("order-3");
		} catch (err) {
			caught = err;
		}
		expect(caught).toBeInstanceOf(AppError);
		expect((caught as AppError).status).toBe(404);
		expect((caught as AppError).message).toContain("order_not_found");
	});
});
