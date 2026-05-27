import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export function createWebEnv(runtimeEnv: Record<string, string | undefined>) {
	return createEnv({
		clientPrefix: "VITE_",
		client: {
			VITE_SERVER_URL: z.string().url(),
			VITE_SUPABASE_URL: z.string().url(),
			VITE_SUPABASE_ANON_KEY: z.string().min(1),
		},
		runtimeEnv,
		emptyStringAsUndefined: true,
	});
}

export type WebEnv = ReturnType<typeof createWebEnv>;
