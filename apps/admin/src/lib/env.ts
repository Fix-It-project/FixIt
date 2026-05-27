import { createWebEnv } from "@FixIt/env/web";

export const env = createWebEnv(
	import.meta.env as unknown as Record<string, string | undefined>,
);
