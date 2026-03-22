import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "cancelled_by_user",
  "cancelled_by_technician",
  "completed",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const authSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
});
export type AuthSession = z.infer<typeof authSessionSchema>;
