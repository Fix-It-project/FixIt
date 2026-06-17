import { z } from "zod";

export const technicianWalletEntrySchema = z.object({
	orderId: z.string(),
	paymentMethod: z.enum(["cash", "card"]),
	grossAmount: z.number(),
	platformFeePercent: z.number(),
	platformFeeAmount: z.number(),
	technicianNetAmount: z.number(),
	paymentStatus: z.string(),
	payoutStatus: z.enum(["pending_settlement", "paid_out"]),
	paidAt: z.string().nullable(),
});

export const technicianWalletSchema = z.object({
	summary: z.object({
		pendingBalance: z.number(),
		paidOutBalance: z.number(),
		lifetimeNet: z.number(),
		lifetimeGross: z.number(),
		lifetimePlatformFees: z.number(),
	}),
	entries: z.array(technicianWalletEntrySchema),
});

export type TechnicianWallet = z.infer<typeof technicianWalletSchema>;
