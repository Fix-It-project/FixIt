import { beforeEach, describe, expect, it } from "vitest";
import { confirm, useDialogStore } from "../dialog-store";

const baseConfig = {
	title: "Are you sure?",
	primary: { label: "Confirm", destructive: true },
	secondary: { label: "Cancel" },
};

describe("dialog-store", () => {
	beforeEach(() => {
		// Clear all dialogs before each test to ensure isolation
		useDialogStore.getState().clear();
	});

	it("default state: stack is an empty array", () => {
		const { stack } = useDialogStore.getState();
		expect(stack).toEqual([]);
	});

	it("push() adds a DialogEntry to the stack and increases length by 1", () => {
		useDialogStore.getState().push(baseConfig);
		expect(useDialogStore.getState().stack).toHaveLength(1);
	});

	it("push() returns a Promise<boolean>", () => {
		const result = useDialogStore.getState().push(baseConfig);
		expect(result).toBeInstanceOf(Promise);
		// Clean up — resolve so we don't have orphaned promises
		useDialogStore.getState().pop(false);
	});

	it("pop(true) resolves the top entry's promise with true and removes it from stack", async () => {
		const promise = useDialogStore.getState().push(baseConfig);
		useDialogStore.getState().pop(true);
		const result = await promise;
		expect(result).toBe(true);
		expect(useDialogStore.getState().stack).toHaveLength(0);
	});

	it("pop(false) resolves the top entry's promise with false and removes it from stack", async () => {
		const promise = useDialogStore.getState().push(baseConfig);
		useDialogStore.getState().pop(false);
		const result = await promise;
		expect(result).toBe(false);
		expect(useDialogStore.getState().stack).toHaveLength(0);
	});

	it("nested dialogs — push A then push B; pop(true) resolves B; stack still has A", async () => {
		const configA = { ...baseConfig, title: "Dialog A" };
		const configB = { ...baseConfig, title: "Dialog B" };
		const promiseA = useDialogStore.getState().push(configA);
		const promiseB = useDialogStore.getState().push(configB);

		expect(useDialogStore.getState().stack).toHaveLength(2);

		useDialogStore.getState().pop(true);
		const resultB = await promiseB;

		expect(resultB).toBe(true);
		expect(useDialogStore.getState().stack).toHaveLength(1);
		expect(useDialogStore.getState().stack[0].config.title).toBe("Dialog A");

		// Clean up A
		useDialogStore.getState().pop(false);
		await promiseA;
	});

	it("clear() empties the stack and resolves all pending promises with false", async () => {
		const promise1 = useDialogStore.getState().push(baseConfig);
		const promise2 = useDialogStore.getState().push({ ...baseConfig, title: "Second" });

		useDialogStore.getState().clear();

		const [result1, result2] = await Promise.all([promise1, promise2]);
		expect(result1).toBe(false);
		expect(result2).toBe(false);
		expect(useDialogStore.getState().stack).toHaveLength(0);
	});

	it("stack is observable via useDialogStore selector", () => {
		useDialogStore.getState().push(baseConfig);
		const stack = useDialogStore.getState().stack;
		expect(stack).toHaveLength(1);
		expect(stack[0].config.title).toBe("Are you sure?");
		useDialogStore.getState().pop(false);
	});

	it("confirm() is a standalone function that calls push() and returns a Promise<boolean>", () => {
		const promise = confirm(baseConfig);
		expect(promise).toBeInstanceOf(Promise);
		expect(useDialogStore.getState().stack).toHaveLength(1);
		useDialogStore.getState().pop(false);
	});

	it("rapid push/pop — multiple sequential pushes and pops resolve correctly", async () => {
		const p1 = useDialogStore.getState().push({ ...baseConfig, title: "1" });
		const p2 = useDialogStore.getState().push({ ...baseConfig, title: "2" });
		const p3 = useDialogStore.getState().push({ ...baseConfig, title: "3" });

		useDialogStore.getState().pop(true);  // resolves 3
		useDialogStore.getState().pop(false); // resolves 2
		useDialogStore.getState().pop(true);  // resolves 1

		const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
		expect(r3).toBe(true);
		expect(r2).toBe(false);
		expect(r1).toBe(true);
		expect(useDialogStore.getState().stack).toHaveLength(0);
	});

	it("clear() during active dialog resolves all with false even when called multiple times", async () => {
		const p1 = useDialogStore.getState().push(baseConfig);
		useDialogStore.getState().clear();
		useDialogStore.getState().clear(); // idempotent — no throw

		const result = await p1;
		expect(result).toBe(false);
		expect(useDialogStore.getState().stack).toHaveLength(0);
	});
});
