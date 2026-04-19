import { router } from "expo-router";
import SettingsContent from "@/src/features/settings/components/SettingsContent";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

export default function SettingsScreen() {
  const goToPrivacy = useDebounce(() => router.push(ROUTES.user.settingsPrivacy));
  const goToHelp = useDebounce(() => router.push(ROUTES.user.settingsHelp));

  return <SettingsContent onPrivacyPress={goToPrivacy} onHelpPress={goToHelp} />;
}
