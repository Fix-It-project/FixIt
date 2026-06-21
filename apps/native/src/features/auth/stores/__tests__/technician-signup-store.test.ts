import { beforeEach, describe, expect, it } from "vitest";
import { useTechnicianSignupStore } from "../technician-signup-store";

describe("useTechnicianSignupStore", () => {
	beforeEach(() => {
		useTechnicianSignupStore.getState().reset();
	});

	it("starts with all step fields empty", () => {
		const state = useTechnicianSignupStore.getState();
		expect(state.email).toBe("");
		expect(state.categories).toEqual([]);
		expect(state.nationalId).toBe("");
	});

	it("accumulates data across the five steps without clobbering prior steps", () => {
		const store = useTechnicianSignupStore.getState();
		store.setStep1Data({ email: "tech@example.com" });
		store.setStep2Data({ phone: "+201001234567" });
		store.setStep3Data({
			firstName: "Sam",
			lastName: "Tech",
			password: "secret123",
		});
		store.setCategoriesData({ categories: ["plumbing", "electrical"] });
		store.setStep5Data({
			nationalId: "file://national.jpg",
			criminalRecord: "file://criminal.jpg",
			certificate: "file://cert.jpg",
			city: "Cairo",
			address: "9 Nile Corniche",
			buildingNumber: "4",
			apartmentNumber: "2",
		});

		const state = useTechnicianSignupStore.getState();
		expect(state.email).toBe("tech@example.com");
		expect(state.phone).toBe("+201001234567");
		expect(state.firstName).toBe("Sam");
		expect(state.categories).toEqual(["plumbing", "electrical"]);
		expect(state.certificate).toBe("file://cert.jpg");
		expect(state.city).toBe("Cairo");
	});

	it("reset clears every collected field", () => {
		useTechnicianSignupStore.getState().setStep1Data({ email: "x@y.com" });
		useTechnicianSignupStore
			.getState()
			.setCategoriesData({ categories: ["plumbing"] });
		useTechnicianSignupStore.getState().reset();

		const state = useTechnicianSignupStore.getState();
		expect(state.email).toBe("");
		expect(state.categories).toEqual([]);
	});
});
