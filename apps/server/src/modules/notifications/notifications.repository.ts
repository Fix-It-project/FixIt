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

export interface NotificationPreferences {
  id?: string;
  recipient_role: RecipientRole;
  recipient_id: string;
  notifications_enabled: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationLog {
  id: string;
  recipient_role: RecipientRole;
  recipient_id: string;
  type: string;
  title: string;
  body: string;
  sender_name: string | null;
  sender_image_url: string | null;
  order_id: string | null;
  viewer_role: RecipientRole | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface UpsertPushDeviceInput {
  recipientRole: RecipientRole;
  recipientId: string;
  expoPushToken: string;
}

export interface UpsertNotificationPreferencesInput {
  recipientRole: RecipientRole;
  recipientId: string;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export interface CreateNotificationLogInput {
  recipientRole: RecipientRole;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  senderName?: string;
  senderImageUrl?: string;
  orderId?: string;
  viewerRole?: RecipientRole;
}

function defaultPreferences(
  recipientRole: RecipientRole,
  recipientId: string,
): NotificationPreferences {
  return {
    recipient_role: recipientRole,
    recipient_id: recipientId,
    notifications_enabled: true,
    sound_enabled: true,
    vibration_enabled: true,
  };
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

  async deleteDevicesForRecipient(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("push_devices")
      .delete()
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId);
    if (error) throw error;
  }

  async deletePreferences(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("notification_preferences")
      .delete()
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId);
    if (error) throw error;
  }

  async ensurePreferences(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<NotificationPreferences> {
    const defaults = defaultPreferences(recipientRole, recipientId);
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(defaults, { onConflict: "recipient_role,recipient_id" })
      .select("*")
      .single();
    if (error) throw error;
    return data as NotificationPreferences;
  }

  async getPreferences(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<NotificationPreferences> {
    return this.ensurePreferences(recipientRole, recipientId);
  }

  async upsertPreferences(
    input: UpsertNotificationPreferencesInput,
  ): Promise<NotificationPreferences> {
    const existing = await this.ensurePreferences(
      input.recipientRole,
      input.recipientId,
    );
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          recipient_role: input.recipientRole,
          recipient_id: input.recipientId,
          notifications_enabled:
            input.notificationsEnabled ?? existing.notifications_enabled,
          sound_enabled: input.soundEnabled ?? existing.sound_enabled,
          vibration_enabled:
            input.vibrationEnabled ?? existing.vibration_enabled,
          updated_at: now,
        },
        { onConflict: "recipient_role,recipient_id" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return data as NotificationPreferences;
  }

  async createNotificationLog(
    input: CreateNotificationLogInput,
  ): Promise<NotificationLog> {
    const { data, error } = await supabase
      .from("notification_logs")
      .insert({
        recipient_role: input.recipientRole,
        recipient_id: input.recipientId,
        type: input.type,
        title: input.title,
        body: input.body,
        sender_name: input.senderName ?? null,
        sender_image_url: input.senderImageUrl ?? null,
        order_id: input.orderId ?? null,
        viewer_role: input.viewerRole ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as NotificationLog;
  }

  async listLogsForRecipient(
    recipientRole: RecipientRole,
    recipientId: string,
    limit: number,
    offset: number,
  ): Promise<NotificationLog[]> {
    const { data, error } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return (data ?? []) as NotificationLog[];
  }

  async countUnreadForRecipient(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<number> {
    const { count, error } = await supabase
      .from("notification_logs")
      .select("*", { count: "exact", head: true })
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId)
      .eq("is_read", false);
    if (error) throw error;
    return count ?? 0;
  }

  async markAllReadForRecipient(
    recipientRole: RecipientRole,
    recipientId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("notification_logs")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("recipient_role", recipientRole)
      .eq("recipient_id", recipientId)
      .eq("is_read", false);
    if (error) throw error;
  }
}

export const notificationsRepository = new NotificationsRepository();
