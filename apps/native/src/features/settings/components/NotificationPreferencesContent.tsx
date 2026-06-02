import { BellRing, Smartphone, type LucideIcon, Vibrate } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Switch, View } from "react-native";
import { useEffect, useState } from "react";
import { Text } from "@/src/components/ui/text";
import {
  Colors,
  elevation,
  shadowStyle,
  useThemeColors,
} from "@/src/constants/design-tokens";
import { useNotificationPreferencesQuery } from "@/src/features/notifications/hooks/useNotificationPreferencesQuery";
import { useUpdateNotificationPreferencesMutation } from "@/src/features/notifications/hooks/useUpdateNotificationPreferencesMutation";
import type {
  NotificationPreferences,
  NotificationPreferencesRole,
} from "@/src/features/notifications/types";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

function PreferenceRow({
  icon: Icon,
  label,
  description,
  value,
  disabled = false,
  onChange,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}>) {
  const themeColors = useThemeColors();
  const contentColor = disabled ? themeColors.textMuted : themeColors.textPrimary;
  const iconOpacity = disabled ? 0.45 : 1;
  const rowOpacity = disabled ? 0.55 : 1;

  return (
    <View
      className="flex-row items-center gap-list-row py-list-row-comfortable-y"
      style={{ opacity: rowOpacity }}
    >
      <View
        className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill bg-app-primary-light"
        style={{ opacity: iconOpacity }}
      >
        <Icon size={18} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text variant="buttonLg" style={{ color: contentColor }}>
          {label}
        </Text>
        <Text
          variant="caption"
          className="mt-stack-xs"
          style={{ color: themeColors.textMuted }}
        >
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{
          true: Colors.primary,
          false: themeColors.borderDefault,
        }}
        thumbColor={themeColors.surfaceBase}
      />
    </View>
  );
}

export default function NotificationPreferencesContent({
  role,
}: Readonly<{
  role: NotificationPreferencesRole;
}>) {
  const themeColors = useThemeColors();
  const { data, isLoading } = useNotificationPreferencesQuery(role);
  const updateMutation = useUpdateNotificationPreferencesMutation(role);
  const [draftPreferences, setDraftPreferences] =
    useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (data) {
      setDraftPreferences(data);
    }
  }, [data]);

  const preferences = data ?? draftPreferences ?? DEFAULT_PREFERENCES;
  const detailControlsDisabled = !preferences.notificationsEnabled;
  const displayedSoundValue = preferences.notificationsEnabled
    ? preferences.soundEnabled
    : false;
  const displayedVibrationValue = preferences.notificationsEnabled
    ? preferences.vibrationEnabled
    : false;

  const updatePreferences = (next: NotificationPreferences) => {
    setDraftPreferences(next);
    updateMutation.mutate(next);
  };

  return (
    <ScrollView
      className="flex-1 bg-surface-elevated"
      contentContainerClassName="px-screen-x py-stack-xl gap-stack-lg"
    >
      <View
        className="rounded-card bg-surface px-card-roomy py-stack-xl"
        style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
      >
        <View className="mb-stack-lg h-avatar-lg w-avatar-lg items-center justify-center rounded-pill bg-app-primary-light">
          <BellRing size={28} color={Colors.primary} strokeWidth={1.8} />
        </View>
        <Text variant="bodyLg" className="font-bold text-content">
          Notification preferences
        </Text>
        <Text variant="bodySm" className="mt-stack-sm text-content-muted">
          Control whether FixIt sends notifications to this device and whether they
          play sound or vibrate when they arrive.
        </Text>
      </View>

      <View
        className="rounded-card bg-surface px-card-roomy py-card-roomy"
        style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
      >
        {isLoading ? (
          <View className="items-center py-stack-xl">
            <ActivityIndicator color={Colors.primary} />
            <Text variant="caption" className="mt-stack-sm text-content-muted">
              Loading notification settings…
            </Text>
          </View>
        ) : (
          <>
            <PreferenceRow
              icon={BellRing}
              label="Notifications"
              description="Master switch for push notifications from FixIt."
              value={preferences.notificationsEnabled}
              onChange={(value) =>
                updatePreferences({
                  ...preferences,
                  notificationsEnabled: value,
                })
              }
            />
            <View
              className="my-stack-sm h-px"
              style={{ backgroundColor: themeColors.borderDefault }}
            />
            <PreferenceRow
              icon={Smartphone}
              label="Sound"
              description="Play the default alert sound for incoming notifications."
              value={displayedSoundValue}
              disabled={detailControlsDisabled}
              onChange={(value) =>
                updatePreferences({
                  ...preferences,
                  soundEnabled: value,
                })
              }
            />
            <View
              className="my-stack-sm h-px"
              style={{ backgroundColor: themeColors.borderDefault }}
            />
            <PreferenceRow
              icon={Vibrate}
              label="Vibration"
              description="Vibrate this device when FixIt notifications arrive."
              value={displayedVibrationValue}
              disabled={detailControlsDisabled}
              onChange={(value) =>
                updatePreferences({
                  ...preferences,
                  vibrationEnabled: value,
                })
              }
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}
