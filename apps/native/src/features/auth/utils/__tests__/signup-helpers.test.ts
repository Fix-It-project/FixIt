import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildFormData,
	type TechnicianSignUpInput,
} from "../signup-helpers";

// React Native's FormData accepts `{ uri, name, type }` file objects that
// Node's built-in FormData rejects, so swap in a minimal recorder that just
// captures every append. This lets us assert the exact multipart field names
// the server contract depends on without a native runtime.
class MockFormData {
	entries: Array<[string, unknown]> = [];
	append(key: string, value: unknown) {
		this.entries.push([key, value]);
	}
	get(key: string) {
		return this.entries.find(([k]) => k === key)?.[1];
	}
}

const DOC = (name: string) => ({
	uri: `file://${name}.jpg`,
	name: `${name}.jpg`,
	type: "image/jpeg",
});

const INPUT: TechnicianSignUpInput = {
	email: "tech@example.com",
	password: "secret123",
	firstName: "Sam",
	lastName: "Tech",
	phone: "+201001234567",
	categoryId: "cat-plumbing",
	city: "Cairo",
	street: "9 Nile Corniche",
	buildingNumber: "4",
	apartmentNumber: "2",
	nationalId: DOC("national"),
	criminalRecord: DOC("criminal"),
	certificate: DOC("certificate"),
};

describe("buildFormData", () => {
	beforeEach(() => {
		vi.stubGlobal("FormData", MockFormData);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("maps camelCase input to the server's snake_case multipart fields", () => {
		const form = buildFormData(INPUT, null) as unknown as MockFormData;

		expect(form.get("email")).toBe("tech@example.com");
		expect(form.get("password")).toBe("secret123");
		expect(form.get("first_name")).toBe("Sam");
		expect(form.get("last_name")).toBe("Tech");
		expect(form.get("phone")).toBe("+201001234567");
		expect(form.get("category_id")).toBe("cat-plumbing");
		expect(form.get("city")).toBe("Cairo");
		expect(form.get("street")).toBe("9 Nile Corniche");
		expect(form.get("building_no")).toBe("4");
		expect(form.get("apartment_no")).toBe("2");
	});

	it("appends documents under their contract field names", () => {
		const form = buildFormData(INPUT, null) as unknown as MockFormData;

		expect(form.get("national_id")).toMatchObject({
			uri: "file://national.jpg",
			name: "national.jpg",
			type: "image/jpeg",
		});
		expect(form.get("criminal_record")).toMatchObject({
			name: "criminal.jpg",
		});
		// Certificate maps to `birth_certificate` on the wire — guard the rename.
		expect(form.get("birth_certificate")).toMatchObject({
			name: "certificate.jpg",
		});
		expect(form.get("certificate")).toBeUndefined();
	});

	it("serializes location as strings when provided", () => {
		const form = buildFormData(INPUT, {
			latitude: 30.06,
			longitude: 31.32,
		}) as unknown as MockFormData;

		expect(form.get("latitude")).toBe("30.06");
		expect(form.get("longitude")).toBe("31.32");
	});

	it("omits location fields when location is null", () => {
		const form = buildFormData(INPUT, null) as unknown as MockFormData;

		expect(form.get("latitude")).toBeUndefined();
		expect(form.get("longitude")).toBeUndefined();
	});

	it("appends the expo push token only when supplied", () => {
		const withToken = buildFormData(
			INPUT,
			null,
			"ExponentPushToken[abc]",
		) as unknown as MockFormData;
		expect(withToken.get("expo_push_token")).toBe("ExponentPushToken[abc]");

		const without = buildFormData(INPUT, null) as unknown as MockFormData;
		expect(without.get("expo_push_token")).toBeUndefined();
	});
});
