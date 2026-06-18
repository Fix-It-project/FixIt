import { z } from "zod";

// ─── Shared Address Fields ──────────────────────────────────────────────────

const addressFieldsSchema = z.object({
	city: z.string().min(1, "auth:validation.cityRequired"),
	street: z
		.string()
		.min(5, "auth:validation.streetMin")
		.max(200, "auth:validation.streetMax"),
	buildingNumber: z.string().optional().or(z.literal("")),
	apartmentNumber: z.string().optional().or(z.literal("")),
});

// ─── User Auth Forms ─────────────────────────────────────────────────────────

export const signUpSchema = z
	.object({
		fullName: z
			.string()
			.min(2, "auth:validation.fullNameMin")
			.max(100, "auth:validation.fullNameMax"),
		email: z.email("auth:validation.emailInvalid"),
		phone: z
			.string()
			.min(1, "auth:validation.phoneRequired")
			.regex(/^[\d\s+()-]+$/, "auth:validation.phoneInvalid"),
		password: z
			.string()
			.min(6, "auth:validation.passwordMin")
			.max(72, "auth:validation.passwordMax"),
		confirmPassword: z
			.string()
			.min(1, "auth:validation.confirmPasswordRequired"),
		...addressFieldsSchema.shape,
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "auth:validation.passwordMismatch",
		path: ["confirmPassword"],
	});

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Step 1 of the two-step user signup (credentials only). Address is collected on
 * step 2 via `addressFieldsSchema`. OAuth users skip this schema entirely and
 * jump to the address step.
 */
export const userStep1Schema = z
	.object({
		fullName: z
			.string()
			.min(2, "auth:validation.fullNameMin")
			.max(100, "auth:validation.fullNameMax"),
		email: z.email("auth:validation.emailInvalid"),
		phone: z
			.string()
			.min(1, "auth:validation.phoneRequired")
			.regex(/^[\d\s+()-]+$/, "auth:validation.phoneInvalid"),
		password: z
			.string()
			.min(6, "auth:validation.passwordMin")
			.max(72, "auth:validation.passwordMax"),
		confirmPassword: z
			.string()
			.min(1, "auth:validation.confirmPasswordRequired"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "auth:validation.passwordMismatch",
		path: ["confirmPassword"],
	});

export type UserStep1Data = z.infer<typeof userStep1Schema>;

/** Step 2 address schema (also used for the OAuth address step). */
export const userAddressSchema = addressFieldsSchema;
export type UserAddressData = z.infer<typeof userAddressSchema>;

export const signInSchema = z.object({
	email: z.email("auth:validation.emailInvalid"),
	password: z.string().min(1, "auth:validation.passwordRequired"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// ─── Technician Signup Step Schemas ──────────────────────────────────────────

export const techStep1Schema = z.object({
	email: z.email("auth:validation.emailInvalid"),
});

export type TechStep1Data = z.infer<typeof techStep1Schema>;

export const techStep2Schema = z.object({
	phone: z
		.string()
		.min(1, "auth:validation.phoneRequired")
		.regex(/^[\d\s+()-]+$/, "auth:validation.phoneInvalid"),
});

export type TechStep2Data = z.infer<typeof techStep2Schema>;

export const techStep3Schema = z
	.object({
		firstName: z
			.string()
			.min(2, "auth:validation.firstNameMin")
			.max(50, "auth:validation.firstNameMax"),
		lastName: z
			.string()
			.min(2, "auth:validation.lastNameMin")
			.max(50, "auth:validation.lastNameMax"),
		password: z
			.string()
			.min(6, "auth:validation.passwordMin")
			.max(72, "auth:validation.passwordMax"),
		confirmPassword: z
			.string()
			.min(1, "auth:validation.confirmPasswordRequired"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "auth:validation.passwordMismatch",
		path: ["confirmPassword"],
	});

export type TechStep3Data = z.infer<typeof techStep3Schema>;

export const techStep5Schema = z.object({
	nationalId: z.string().min(1, "auth:validation.nationalIdRequired"),
	criminalRecord: z.string().min(1, "auth:validation.criminalRecordRequired"),
	certificate: z.string().min(1, "auth:validation.certificateRequired"),
	address: z
		.string()
		.min(5, "auth:validation.addressMin")
		.max(200, "auth:validation.addressMax"),
	...addressFieldsSchema.omit({ street: true }).shape,
});

export type TechStep5Data = z.infer<typeof techStep5Schema>;

// ─── Forgot / Reset Password Schemas ─────────────────────────────────────────

export const forgotPasswordSchema = z.object({
	email: z.email("auth:validation.emailInvalid"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
	.object({
		newPassword: z
			.string()
			.min(6, "auth:validation.passwordMin")
			.max(72, "auth:validation.passwordMax"),
		confirmPassword: z
			.string()
			.min(1, "auth:validation.confirmPasswordRequired"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "auth:validation.passwordMismatch",
		path: ["confirmPassword"],
	});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Technician Full Signup Schema ────────────────────────────────────────────

/**
 * Composite schema that validates the full technician signup payload
 * combining all five steps. Used for a final pre-submission check
 * in signup-step5 before calling the API.
 */
export const technicianSignupSchema = z
	.object({
		// Step 1
		email: z.email("auth:validation.emailInvalid"),

		// Step 2
		phone: z
			.string()
			.min(1, "auth:validation.phoneRequired")
			.regex(/^[\d\s+()-]+$/, "auth:validation.phoneInvalid"),
		categories: z
			.array(z.string().min(1))
			.min(1, "auth:validation.categoryRequired"),

		// Step 3
		firstName: z
			.string()
			.min(2, "auth:validation.firstNameMin")
			.max(50, "auth:validation.firstNameMax"),
		lastName: z
			.string()
			.min(2, "auth:validation.lastNameMin")
			.max(50, "auth:validation.lastNameMax"),
		password: z
			.string()
			.min(6, "auth:validation.passwordMin")
			.max(72, "auth:validation.passwordMax"),
		confirmPassword: z
			.string()
			.min(1, "auth:validation.confirmPasswordRequired"),

		// Step 4 – document file URIs
		nationalId: z.string().min(1, "auth:validation.nationalIdRequired"),
		criminalRecord: z.string().min(1, "auth:validation.criminalRecordRequired"),
		certificate: z.string().min(1, "auth:validation.certificateRequired"),

		// Step 5 – address
		city: z.string().min(1, "auth:validation.cityRequired"),
		address: z
			.string()
			.min(5, "auth:validation.addressMin")
			.max(200, "auth:validation.addressMax"),
		buildingNumber: z.string().optional().or(z.literal("")),
		apartmentNumber: z.string().optional().or(z.literal("")),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "auth:validation.passwordMismatch",
		path: ["confirmPassword"],
	});

export type TechnicianSignupData = z.infer<typeof technicianSignupSchema>;
