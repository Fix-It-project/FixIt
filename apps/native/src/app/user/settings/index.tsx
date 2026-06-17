import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import SettingsContent from "@/src/features/settings/components/SettingsContent";

export default function SettingsScreen() {
	return (
		<>
			<ScreenStatusBar variant="surface" />
			<SettingsContent userType="user" />
		</>
	);
}
