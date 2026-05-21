import { describe, expect, it } from "vitest";
import { AppError } from "../../../../shared/errors/index.js";
import {
	type LegacyPatchAction,
	mapTechnicianPatchToAction,
	mapUserPatchToAction,
} from "../legacy-patch-shim.js";

/**
 * Unit coverage for the Phase 2 Plan 02-04 legacy PATCH shim.
 *
 * Tests every legal mapping, the 410-Gone branch (PATCH technician
 * status='completed'), reschedule short-circuit, and invalid payloads on
 * both endpoints.
 */

describe("mapUserPatchToAction", () => {
	it("maps { cancel: true } → cancel with null reason", () => {
		const action = mapUserPatchToAction({ cancel: true });
		expect(action).toEqual<LegacyPatchAction>({ kind: "cancel", reason: null });
	});

	it("maps { cancel: true, cancellation_reason } → cancel with reason", () => {
		const action = mapUserPatchToAction({
			cancel: true,
			cancellation_reason: "changed_mind",
		});
		expect(action).toEqual<LegacyPatchAction>({
			kind: "cancel",
			reason: "changed_mind",
		});
	});

	it("ignores non-string cancellation_reason → reason null", () => {
		const action = mapUserPatchToAction({
			cancel: true,
			cancellation_reason: 42,
		});
		expect(action).toEqual<LegacyPatchAction>({ kind: "cancel", reason: null });
	});

	it("throws AppError(400, invalid_legacy_patch_payload) for { cancel: false }", () => {
		try {
			mapUserPatchToAction({ cancel: false });
			throw new Error("should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			expect((err as AppError).status).toBe(400);
			expect((err as AppError).message).toBe("invalid_legacy_patch_payload");
		}
	});

	it("throws AppError(400) for an empty body", () => {
		try {
			mapUserPatchToAction({});
			throw new Error("should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			expect((err as AppError).status).toBe(400);
			expect((err as AppError).message).toBe("invalid_legacy_patch_payload");
		}
	});

	it("throws AppError(400) for non-object body (null)", () => {
		expect(() => mapUserPatchToAction(null)).toThrowError(AppError);
	});

	it("throws AppError(400) for a stray status field without cancel:true", () => {
		expect(() => mapUserPatchToAction({ status: "accepted" })).toThrowError(
			AppError,
		);
	});
});

describe("mapTechnicianPatchToAction", () => {
	it("maps { status: 'accepted' } → tech_accept", () => {
		expect(
			mapTechnicianPatchToAction({ status: "accepted" }),
		).toEqual<LegacyPatchAction>({
			kind: "tech_accept",
		});
	});

	it("maps { status: 'rejected' } → tech_decline with null reason", () => {
		expect(
			mapTechnicianPatchToAction({ status: "rejected" }),
		).toEqual<LegacyPatchAction>({
			kind: "tech_decline",
			reason: null,
		});
	});

	it("maps { status: 'rejected', cancellation_reason } → tech_decline with reason", () => {
		expect(
			mapTechnicianPatchToAction({
				status: "rejected",
				cancellation_reason: "busy",
			}),
		).toEqual<LegacyPatchAction>({ kind: "tech_decline", reason: "busy" });
	});

	it("maps { status: 'cancelled_by_technician' } → tech_cancel with null reason", () => {
		expect(
			mapTechnicianPatchToAction({ status: "cancelled_by_technician" }),
		).toEqual<LegacyPatchAction>({ kind: "tech_cancel", reason: null });
	});

	it("maps { status: 'cancelled_by_technician', cancellation_reason } → tech_cancel with reason", () => {
		expect(
			mapTechnicianPatchToAction({
				status: "cancelled_by_technician",
				cancellation_reason: "vehicle_breakdown",
			}),
		).toEqual<LegacyPatchAction>({
			kind: "tech_cancel",
			reason: "vehicle_breakdown",
		});
	});

	it("maps { status: 'completed' } → gone with documented hint (D3)", () => {
		const action = mapTechnicianPatchToAction({ status: "completed" });
		expect(action.kind).toBe("gone");
		if (action.kind === "gone") {
			expect(action.hint).toContain("finish-inspection");
			expect(action.hint).toContain("confirm-completion");
		}
	});

	it.each([
		["reschedule_requested_by_user"],
		["reschedule_requested_by_technician"],
		["reschedule_accepted"],
		["reschedule_declined"],
	])("throws AppError(400, use_reschedule_route) for status=%s", (status) => {
		try {
			mapTechnicianPatchToAction({ status });
			throw new Error("should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			expect((err as AppError).status).toBe(400);
			expect((err as AppError).message).toBe("use_reschedule_route");
		}
	});

	it("throws AppError(400, invalid_legacy_patch_payload) for an unknown status", () => {
		try {
			mapTechnicianPatchToAction({ status: "pending" });
			throw new Error("should have thrown");
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			expect((err as AppError).status).toBe(400);
			expect((err as AppError).message).toBe("invalid_legacy_patch_payload");
		}
	});

	it("throws AppError(400) for an empty body", () => {
		expect(() => mapTechnicianPatchToAction({})).toThrowError(AppError);
	});

	it("throws AppError(400) for null body", () => {
		expect(() => mapTechnicianPatchToAction(null)).toThrowError(AppError);
	});
});
