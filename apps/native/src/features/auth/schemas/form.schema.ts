import { z } from "zod";

// ─── Shared Address Fields ──────────────────────────────────────────────────

const addressFieldsSchema = z.object({
  city: z.string().min(1, "City is required"),
  street: z
    .string()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address must be less than 200 characters"),
  buildingNumber: z.string().optional().or(z.literal("")),
  apartmentNumber: z.string().optional().or(z.literal("")),
});

// ─── User Auth Forms ─────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters"),
    email: z.email("Please enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(
        /^[\d\s+()-]+$/,
        "Please enter a valid phone number"
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
    ...addressFieldsSchema.shape,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// ─── Technician Signup Step Schemas ──────────────────────────────────────────

export const techStep1Schema = z.object({
  email: z.email("Please enter a valid email address"),
});

export type TechStep1Data = z.infer<typeof techStep1Schema>;

export const techStep2Schema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[\d\s+()-]+$/, "Please enter a valid phone number"),
});

export type TechStep2Data = z.infer<typeof techStep2Schema>;

export const techStep3Schema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TechStep3Data = z.infer<typeof techStep3Schema>;

export const techStep5Schema = z
  .object({
    nationalId: z.string().min(1, "National ID is required"),
    criminalRecord: z.string().min(1, "Criminal record document is required"),
    certificate: z.string().min(1, "Certificate is required"),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address must be less than 200 characters"),
    ...addressFieldsSchema.omit({ street: true }).shape,
  })
  ;

export type TechStep5Data = z.infer<typeof techStep5Schema>;

// ─── Forgot / Reset Password Schemas ─────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
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
    email: z.email("Please enter a valid email address"),

    // Step 2
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[\d\s+()-]+$/, "Please enter a valid phone number"),
    categories: z
      .array(z.string().min(1))
      .min(1, "At least one category must be selected"),

    // Step 3
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),

    // Step 4 – document file URIs
    nationalId: z.string().min(1, "National ID is required"),
    criminalRecord: z
      .string()
      .min(1, "Criminal record document is required"),
    certificate: z.string().min(1, "Certificate is required"),

    // Step 5 – address
    city: z.string().min(1, "City is required"),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address must be less than 200 characters"),
    buildingNumber: z.string().optional().or(z.literal("")),
    apartmentNumber: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TechnicianSignupData = z.infer<typeof technicianSignupSchema>;
