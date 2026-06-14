import { router } from "expo-router";
import SettingsContent from "@/src/features/settings/components/SettingsContent";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

export default function TechnicianSettingsScreen() {
	const goToNotifications = useDebounce(() =>
		router.push(ROUTES.technician.settingsNotifications as never),
	);
	const goToPrivacy = useDebounce(() =>
		router.push(ROUTES.technician.settingsPrivacy),
	);
	const goToHelp = useDebounce(() =>
		router.push(ROUTES.technician.settingsHelp),
	);
	const goToAddress = useDebounce(() =>
		router.push(ROUTES.technician.settingsAddress as never),
	);
	const goToServices = useDebounce(() =>
		router.push(ROUTES.technician.settingsServices as never),
	);

	return (
		<SettingsContent
			onAddressPress={goToAddress}
			onServicesPress={goToServices}
			onNotificationsPress={goToNotifications}
			onPrivacyPress={goToPrivacy}
			onHelpPress={goToHelp}
		/>
	);
}
