import { z } from "zod";

export const PushDeviceBodySchema = z.object({
  expo_push_token: z.string().trim().min(1, "expo_push_token is required"),
});

export type PushDeviceBody = z.infer<typeof PushDeviceBodySchema>;

export const NotificationPreferencesBodySchema = z
  .object({
    notifications_enabled: z.boolean().optional(),
    sound_enabled: z.boolean().optional(),
    vibration_enabled: z.boolean().optional(),
  })
  .strict()
  .refine(
    (value) =>
      value.notifications_enabled !== undefined ||
      value.sound_enabled !== undefined ||
      value.vibration_enabled !== undefined,
    { message: "at least one notification preference is required" },
  );

export type NotificationPreferencesBody = z.infer<
  typeof NotificationPreferencesBodySchema
>;

export const NotificationLogsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type NotificationLogsQuery = z.infer<typeof NotificationLogsQuerySchema>;
