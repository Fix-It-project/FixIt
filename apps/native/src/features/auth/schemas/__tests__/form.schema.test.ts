import { describe, expect, it } from "vitest";
import {
	forgotPasswordSchema,
	resetPasswordSchema,
	signInSchema,
	signUpSchema,
	techStep1Schema,
	techStep2Schema,
	techStep3Schema,
	techStep5Schema,
	technicianSignupSchema,
	userAddressSchema,
	userStep1Schema,
} from "../form.schema";

// Unit-level validation rules. These guard the exact messages (i18n keys) and
// refinement paths the screens rely on to render field errors, so changes to a
// rule surface here before they reach a form.

const VALID_USER_STEP1 = {
	fullName: "Jane Homeowner",
	email: "jane@example.com",
	phone: "+20 100 123 4567",
	password: "secret123",
	confirmPassword: "secret123",
};

describe("signInSchema", () => {
	it("accepts a valid email + non-empty password", () => {
		const result = signInSchema.safeParse({
			email: "jane@example.com",
			password: "x",
		});
		expect(result.success).toBe(true);
	});

	it("rejects an invalid email with the emailInvalid key", () => {
		const result = signInSchema.safeParse({
			email: "not-an-email",
			password: "secret",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				"auth:validation.emailInvalid",
			);
		}
	});

	it("rejects an empty password with the passwordRequired key", () => {
		const result = signInSchema.safeParse({
			email: "jane@example.com",
			password: "",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe(
				"auth:validation.passwordRequired",
			);
		}
	});
});

describe("userStep1Schema", () => {
	it("accepts a fully valid step-1 payload", () => {
		expect(userStep1Schema.safeParse(VALID_USER_STEP1).success).toBe(true);
	});

	it("flags mismatched passwords on the confirmPassword path", () => {
		const result = userStep1Schema.safeParse({
			...VALID_USER_STEP1,
			confirmPassword: "different",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			const issue = result.error.issues[0];
			expect(issue?.message).toBe("auth:validation.passwordMismatch");
			expect(issue?.path).toEqual(["confirmPassword"]);
		}
	});

	it("rejects a too-short full name", () => {
		const result = userStep1Schema.safeParse({
			...VALID_USER_STEP1,
			fullName: "J",
		});
		expect(result.success).toBe(false);
	});

	it.each([
		["letters in phone", "12ab34"],
		["empty phone", ""],
	])("rejects %s", (_label, phone) => {
		expect(
			userStep1Schema.safeParse({ ...VALID_USER_STEP1, phone }).success,
		).toBe(false);
	});

	it("rejects a password shorter than 6 chars", () => {
		expect(
			userStep1Schema.safeParse({
				...VALID_USER_STEP1,
				password: "12345",
				confirmPassword: "12345",
			}).success,
		).toBe(false);
	});
});

describe("signUpSchema (credentials + address)", () => {
	const VALID_SIGNUP = {
		...VALID_USER_STEP1,
		city: "Cairo",
		street: "12 Tahrir Street",
		buildingNumber: "4",
		apartmentNumber: "2",
	};

	it("accepts a full payload with optional building/apartment", () => {
		expect(signUpSchema.safeParse(VALID_SIGNUP).success).toBe(true);
	});

	it("treats empty building/apartment numbers as valid", () => {
		expect(
			signUpSchema.safeParse({
				...VALID_SIGNUP,
				buildingNumber: "",
				apartmentNumber: "",
			}).success,
		).toBe(true);
	});

	it("rejects a street shorter than 5 chars", () => {
		expect(
			signUpSchema.safeParse({ ...VALID_SIGNUP, street: "12" }).success,
		).toBe(false);
	});

	it("requires a city", () => {
		expect(
			signUpSchema.safeParse({ ...VALID_SIGNUP, city: "" }).success,
		).toBe(false);
	});
});

describe("userAddressSchema", () => {
	it("validates the standalone address step", () => {
		expect(
			userAddressSchema.safeParse({
				city: "Giza",
				street: "5 Pyramids Road",
				buildingNumber: "",
				apartmentNumber: "",
			}).success,
		).toBe(true);
	});
});

describe("forgot / reset password schemas", () => {
	it("forgotPasswordSchema accepts a valid email", () => {
		expect(
			forgotPasswordSchema.safeParse({ email: "jane@example.com" }).success,
		).toBe(true);
	});

	it("resetPasswordSchema enforces matching new passwords", () => {
		const result = resetPasswordSchema.safeParse({
			newPassword: "brandnew1",
			confirmPassword: "brandnew2",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
		}
	});

	it("resetPasswordSchema accepts a matching pair", () => {
		expect(
			resetPasswordSchema.safeParse({
				newPassword: "brandnew1",
				confirmPassword: "brandnew1",
			}).success,
		).toBe(true);
	});
});

describe("technician step schemas", () => {
	it("techStep1Schema requires a valid email", () => {
		expect(techStep1Schema.safeParse({ email: "tech@example.com" }).success).toBe(
			true,
		);
		expect(techStep1Schema.safeParse({ email: "nope" }).success).toBe(false);
	});

	it("techStep2Schema validates the phone format", () => {
		expect(techStep2Schema.safeParse({ phone: "+201001234567" }).success).toBe(
			true,
		);
		expect(techStep2Schema.safeParse({ phone: "abc" }).success).toBe(false);
	});

	it("techStep3Schema enforces name lengths and password match", () => {
		const base = {
			firstName: "Sam",
			lastName: "Tech",
			password: "secret123",
			confirmPassword: "secret123",
		};
		expect(techStep3Schema.safeParse(base).success).toBe(true);
		expect(
			techStep3Schema.safeParse({ ...base, firstName: "S" }).success,
		).toBe(false);
		expect(
			techStep3Schema.safeParse({ ...base, confirmPassword: "nope" }).success,
		).toBe(false);
	});

	it("techStep5Schema requires documents + address (no street field)", () => {
		const result = techStep5Schema.safeParse({
			nationalId: "file://national.jpg",
			criminalRecord: "file://criminal.jpg",
			certificate: "file://cert.jpg",
			address: "9 Nile Corniche",
			city: "Cairo",
			buildingNumber: "",
			apartmentNumber: "",
		});
		expect(result.success).toBe(true);
	});

	it("techStep5Schema rejects a missing national id", () => {
		expect(
			techStep5Schema.safeParse({
				nationalId: "",
				criminalRecord: "file://criminal.jpg",
				certificate: "file://cert.jpg",
				address: "9 Nile Corniche",
				city: "Cairo",
			}).success,
		).toBe(false);
	});
});

describe("technicianSignupSchema (composite pre-submission check)", () => {
	const FULL = {
		email: "tech@example.com",
		phone: "+201001234567",
		categories: ["plumbing"],
		firstName: "Sam",
		lastName: "Tech",
		password: "secret123",
		confirmPassword: "secret123",
		nationalId: "file://national.jpg",
		criminalRecord: "file://criminal.jpg",
		certificate: "file://cert.jpg",
		city: "Cairo",
		address: "9 Nile Corniche",
		buildingNumber: "",
		apartmentNumber: "",
	};

	it("accepts a complete, consistent payload", () => {
		expect(technicianSignupSchema.safeParse(FULL).success).toBe(true);
	});

	it("requires at least one category", () => {
		expect(
			technicianSignupSchema.safeParse({ ...FULL, categories: [] }).success,
		).toBe(false);
	});

	it("rejects mismatched passwords on confirmPassword", () => {
		const result = technicianSignupSchema.safeParse({
			...FULL,
			confirmPassword: "different",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
		}
	});
});
