import { router } from "expo-router";
import SettingsContent from "@/src/features/settings/components/SettingsContent";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

export default function TechnicianSettingsScreen() {
	const goToPrivacy = useDebounce(() =>
		router.push(ROUTES.technician.settingsPrivacy),
	);
	const goToHelp = useDebounce(() =>
		router.push(ROUTES.technician.settingsHelp),
	);

	return (
		<SettingsContent onPrivacyPress={goToPrivacy} onHelpPress={goToHelp} />
	);
}
