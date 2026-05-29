import { supabaseAdmin } from "../../shared/db/supabase.js";

const supabase = supabaseAdmin;

export type RecipientRole = "user" | "technician";

export interface PushDevice {
  id: string;
  recipient_role: RecipientRole;
  recipient_id: string;
  expo_push_token: string;
  is_active: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertPushDeviceInput {
  recipientRole: RecipientRole;
  recipientId: string;
  expoPushToken: string;
}

export class NotificationsRepository {
  async recipientExists(role: RecipientRole, recipientId: string): Promise<boolean> {
    const table = role === "user" ? "users" : "technicians";
    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("id", recipientId)
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  async getByExpoPushToken(expoPushToken: string): Promise<PushDevice | undefined> {
    const { data, error } = await supabase
      .from("push_devices")
      .select("*")
      .eq("expo_push_token", expoPushToken)
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as PushDevice | undefined;
  }

  async upsertDevice(input: UpsertPushDeviceInput): Promise<PushDevice> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("push_devices")
      .upsert(
        {
          recipient_role: input.recipientRole,
          recipient_id: input.recipientId,
          expo_push_token: input.expoPushToken,
          is_active: true,
          last_seen_at: now,
          updated_at: now,
        },
        { onConflict: "expo_push_token" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return data as PushDevice;
  }

  async deactivateByExpoPushToken(
    recipientRole: RecipientRole,
    recipientId: string,
    expoPushToken: string,
  ): Promise<PushDevice | undefined> {
    const { data, error } = await supabase
      .from("push_devices")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId)
      .eq("expo_push_token", expoPushToken)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return (data ?? undefined) as PushDevice | undefined;
  }

  async deactivateByExpoPushTokenValue(expoPushToken: string): Promise<void> {
    const { error } = await supabase
      .from("push_devices")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("expo_push_token", expoPushToken);
    if (error) throw error;
  }

  async listActiveDevicesForRecipient(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<PushDevice[]> {
    const { data, error } = await supabase
      .from("push_devices")
      .select("*")
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId)
      .eq("is_active", true);
    if (error) throw error;
    return (data ?? []) as PushDevice[];
  }
}

export const notificationsRepository = new NotificationsRepository();
