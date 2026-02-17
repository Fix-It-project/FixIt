import { z } from "zod";

//sign up and sign in type validation with zod
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
        /^[\d\s\-\+\(\)]+$/,
        "Please enter a valid phone number"
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
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
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
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

export const techStep4Schema = z.object({
  nationalId: z.string().min(1, "National ID is required"),
  criminalRecord: z.string().min(1, "Criminal record document is required"),
  certificate: z.string().min(1, "Certificate is required"),
  city: z.string().min(1, "City is required"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be less than 200 characters"),
  buildingNumber: z.string().min(1, "Building number is required"),
  apartmentNumber: z.string().min(1, "Apartment number is required"),
});

export type TechStep4Data = z.infer<typeof techStep4Schema>;

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
