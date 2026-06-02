import { router } from "expo-router";
import SettingsContent from "@/src/features/settings/components/SettingsContent";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

export default function SettingsScreen() {
	const goToNotifications = useDebounce(() =>
		router.push(ROUTES.user.settingsNotifications as never),
	);
	const goToPrivacy = useDebounce(() =>
		router.push(ROUTES.user.settingsPrivacy),
	);
	const goToHelp = useDebounce(() => router.push(ROUTES.user.settingsHelp));

	return (
		<SettingsContent
			onNotificationsPress={goToNotifications}
			onPrivacyPress={goToPrivacy}
			onHelpPress={goToHelp}
		/>
	);
}
