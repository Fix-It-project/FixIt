import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    SUPABASE_CONNECTION_STRING: z.string().min(1),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    CORS_ORIGIN: z.string().min(1),
    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD_HASH: z.string().min(1),
    ADMIN_JWT_SECRET: z.string().min(16),
    ADMIN_SESSION_TTL_SECONDS: z.coerce.number().positive().default(43200),
    // Keep admin auth on SameSite=Lax by default; set to `none` for cross-site
    // admin frontends talking to the deployed API over HTTPS.
    ADMIN_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
    STORAGE_BUCKET: z.string().min(1),
    ORDER_BUCKET: z.string().min(1),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    // Public base URL of the deployed API (API Gateway / custom domain), used to
    // build Paymob notification_url (webhook) and redirection_url (browser return).
    API_PUBLIC_URL: z.string().url().optional(),
    // Paymob — optional so local/test/CI without payment creds still boots; the
    // adapter throws `paymob_not_configured` at call time when a required one is
    // missing. SECRET_KEY authenticates the Intention API (Bearer token).
    PAYMOB_API_KEY: z.string().optional(),
    PAYMOB_SECRET_KEY: z.string().optional(),
    PAYMOB_PUBLIC_KEY: z.string().optional(),
    PAYMOB_INTEGRATION_ID: z.string().optional(),
    PAYMOB_IFRAME_ID: z.string().optional(),
    PAYMOB_HMAC_SECRET: z.string().optional(),
    PAYMOB_BASE_URL: z.string().url().optional(),
    PAYMOB_IFRAME_BASE_URL: z.string().url().optional(),
    PAYMOB_UNIFIED_CHECKOUT_URL: z.string().url().optional(),
    PAYMOB_CURRENCY: z.string().default("EGP"),
    PAYMOB_PLATFORM_FEE_PERCENT: z.coerce.number().min(0).max(100).default(5),
    // Preserve legacy semantics: anything other than the literal "false" is sandbox.
    PAYMOB_SANDBOX_MODE: z
      .string()
      .optional()
      .transform((v) => (v ?? "true").toLowerCase() !== "false"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
