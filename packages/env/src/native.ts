import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "EXPO_PUBLIC_",
  client: {
    EXPO_PUBLIC_SERVER_URL: z.string().url(),
    EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
    // locize translation management. Project id is public/safe. The API key is
    // DEV/CI ONLY (saveMissing + locize-cli) — never set it in a production build.
    EXPO_PUBLIC_LOCIZE_PROJECT_ID: z.string().optional(),
    EXPO_PUBLIC_LOCIZE_API_KEY: z.string().optional(),
    // Public Google Maps key (ships in the app — restrict it in Cloud Console).
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  },
  runtimeEnv: {
    EXPO_PUBLIC_SERVER_URL: process.env.EXPO_PUBLIC_SERVER_URL,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_LOCIZE_PROJECT_ID: process.env.EXPO_PUBLIC_LOCIZE_PROJECT_ID,
    EXPO_PUBLIC_LOCIZE_API_KEY: process.env.EXPO_PUBLIC_LOCIZE_API_KEY,
    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  emptyStringAsUndefined: true,
});
