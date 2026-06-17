import { z } from "zod";

export const cardSessionSchema = z.object({
	provider: z.literal("paymob"),
	paymentId: z.string(),
	clientSecret: z.string(),
	publicKey: z.string().nullable().optional(),
	expiresAt: z.string(),
	checkoutUrl: z.string().url(),
});

export type CardSession = z.infer<typeof cardSessionSchema>;
