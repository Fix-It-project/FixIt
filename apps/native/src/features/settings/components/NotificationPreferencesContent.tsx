import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, Switch, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
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
	label,
	description,
	value,
	disabled = false,
	onChange,
}: Readonly<{
	label: string;
	description: string;
	value: boolean;
	disabled?: boolean;
	onChange: (value: boolean) => void;
}>) {
	const themeColors = useThemeColors();
	const contentColor = disabled
		? themeColors.textMuted
		: themeColors.textPrimary;

	return (
		<View
			className="flex-row items-center gap-stack-md py-list-row-comfortable-y"
			style={{ opacity: disabled ? 0.55 : 1 }}
		>
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
	const { t } = useTranslation("settings");
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

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator color={Colors.primary} />
			</View>
		);
	}

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-lg"
		>
			<PreferenceRow
				label={t("notifications.notificationsLabel")}
				description={t("notifications.notificationsDesc")}
				value={preferences.notificationsEnabled}
				onChange={(value) =>
					updatePreferences({
						...preferences,
						notificationsEnabled: value,
					})
				}
			/>
			<Separator />
			<PreferenceRow
				label={t("notifications.soundLabel")}
				description={t("notifications.soundDesc")}
				value={displayedSoundValue}
				disabled={detailControlsDisabled}
				onChange={(value) =>
					updatePreferences({
						...preferences,
						soundEnabled: value,
					})
				}
			/>
			<Separator />
			<PreferenceRow
				label={t("notifications.vibrationLabel")}
				description={t("notifications.vibrationDesc")}
				value={displayedVibrationValue}
				disabled={detailControlsDisabled}
				onChange={(value) =>
					updatePreferences({
						...preferences,
						vibrationEnabled: value,
					})
				}
			/>
		</ScrollView>
	);
}
