import { beforeEach, describe, expect, it } from "vitest";

import { useActiveOrderStore } from "../active-order-store";

describe("active-order-store", () => {
	beforeEach(() => {
		useActiveOrderStore.getState().reset();
	});

	it("starts with empty defaults", () => {
		const state = useActiveOrderStore.getState();
		expect(state.currentOrderId).toBeNull();
		expect(state.lastSeenStatus).toBeNull();
		expect(state.optimisticTransition).toBeNull();
		expect(state.animationLocks.size).toBe(0);
	});

	it("setCurrent records the active order id", () => {
		useActiveOrderStore.getState().setCurrent("o-1");
		expect(useActiveOrderStore.getState().currentOrderId).toBe("o-1");

		useActiveOrderStore.getState().setCurrent(null);
		expect(useActiveOrderStore.getState().currentOrderId).toBeNull();
	});

	it("setLastSeenStatus records and clears the last seen status", () => {
		useActiveOrderStore.getState().setLastSeenStatus("tracking");
		expect(useActiveOrderStore.getState().lastSeenStatus).toBe("tracking");

		useActiveOrderStore.getState().setLastSeenStatus(null);
		expect(useActiveOrderStore.getState().lastSeenStatus).toBeNull();
	});

	it("setOptimisticTransition stores then clearOptimisticTransition removes it", () => {
		const transition = {
			orderId: "o-1",
			to: "tracking" as const,
			startedAt: 1,
		};
		useActiveOrderStore.getState().setOptimisticTransition(transition);
		expect(useActiveOrderStore.getState().optimisticTransition).toEqual(
			transition,
		);

		useActiveOrderStore.getState().clearOptimisticTransition();
		expect(useActiveOrderStore.getState().optimisticTransition).toBeNull();
	});

	it("acquireAnimationLock + releaseAnimationLock manipulate the lock set", () => {
		const store = useActiveOrderStore.getState();
		store.acquireAnimationLock("step-slide");
		expect(useActiveOrderStore.getState().hasAnimationLock("step-slide")).toBe(
			true,
		);

		useActiveOrderStore.getState().releaseAnimationLock("step-slide");
		expect(useActiveOrderStore.getState().hasAnimationLock("step-slide")).toBe(
			false,
		);
	});

	it("releaseAnimationLock on a key that is not held is a no-op", () => {
		expect(() =>
			useActiveOrderStore.getState().releaseAnimationLock("never-held"),
		).not.toThrow();
		expect(useActiveOrderStore.getState().animationLocks.size).toBe(0);
	});

	it("acquireAnimationLock is idempotent and supports multiple keys", () => {
		useActiveOrderStore.getState().acquireAnimationLock("a");
		useActiveOrderStore.getState().acquireAnimationLock("a");
		useActiveOrderStore.getState().acquireAnimationLock("b");
		const locks = useActiveOrderStore.getState().animationLocks;
		expect(locks.size).toBe(2);
		expect(locks.has("a")).toBe(true);
		expect(locks.has("b")).toBe(true);
	});

	it("animationLocks mutation produces a new Set reference (immutable update)", () => {
		const before = useActiveOrderStore.getState().animationLocks;
		useActiveOrderStore.getState().acquireAnimationLock("x");
		const after = useActiveOrderStore.getState().animationLocks;
		expect(after).not.toBe(before);
	});

	it("reset returns the store to defaults from a populated state", () => {
		useActiveOrderStore.setState({
			currentOrderId: "o-99",
			lastSeenStatus: "in_progress",
			optimisticTransition: { orderId: "o-99", to: "completed", startedAt: 42 },
			animationLocks: new Set(["lock-a", "lock-b"]),
		});

		useActiveOrderStore.getState().reset();
		const state = useActiveOrderStore.getState();
		expect(state.currentOrderId).toBeNull();
		expect(state.lastSeenStatus).toBeNull();
		expect(state.optimisticTransition).toBeNull();
		expect(state.animationLocks.size).toBe(0);
	});
});
