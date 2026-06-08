import { z } from "zod";

export const TechnicianIdParamSchema = z.object({
	id: z.string().uuid("Invalid technician id"),
});

export const BlockTechnicianBodySchema = z.object({
	reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});

export type TechnicianIdParam = z.infer<typeof TechnicianIdParamSchema>;
export type BlockTechnicianBody = z.infer<typeof BlockTechnicianBodySchema>;
