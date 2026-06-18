import Constants from "expo-constants";
import { FileText, ScrollText, Shield } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { SettingsItem } from "./SettingsItem";

// Public policy/terms URLs (placeholders — point at the marketing site).
const TERMS_URL = "https://fixit.app/terms";
const PRIVACY_URL = "https://fixit.app/privacy";

export function AboutSettingsContent() {
	const { t } = useTranslation("settings");
	const version =
		Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "—";

	const openTerms = () => void Linking.openURL(TERMS_URL);
	const openPrivacy = () => void Linking.openURL(PRIVACY_URL);

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-xl"
		>
			<View className="items-center py-stack-xl">
				<Text variant="h3" className="font-bold text-content">
					{t("about.appName")}
				</Text>
				<Text variant="caption" className="mt-stack-xs text-content-muted">
					{t("about.version", { version })}
				</Text>
			</View>

			<SettingsItem
				icon={ScrollText}
				label={t("about.terms")}
				onPress={openTerms}
			/>
			<SettingsItem
				icon={Shield}
				label={t("about.privacy")}
				onPress={openPrivacy}
			/>
			<SettingsItem
				icon={FileText}
				label={t("about.licenses")}
				onPress={() => {}}
				hideChevron
			/>
		</ScrollView>
	);
}
