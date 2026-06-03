import { z } from "zod";

export const HomeownerIdParamSchema = z.object({
	id: z.string().uuid("Invalid homeowner id"),
});

export const BlockHomeownerBodySchema = z.object({
	reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});

export type HomeownerIdParam = z.infer<typeof HomeownerIdParamSchema>;
export type BlockHomeownerBody = z.infer<typeof BlockHomeownerBodySchema>;
