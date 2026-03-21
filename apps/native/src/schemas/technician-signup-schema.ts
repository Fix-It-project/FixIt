import { z } from "zod";

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
      .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
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
    buildingNumber: z.string().min(1, "Building number is required"),
    apartmentNumber: z.string().min(1, "Apartment number is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TechnicianSignupData = z.infer<typeof technicianSignupSchema>;
