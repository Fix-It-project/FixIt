import { z } from "zod";

export const PushDeviceBodySchema = z.object({
  expo_push_token: z.string().trim().min(1, "expo_push_token is required"),
});

export type PushDeviceBody = z.infer<typeof PushDeviceBodySchema>;
