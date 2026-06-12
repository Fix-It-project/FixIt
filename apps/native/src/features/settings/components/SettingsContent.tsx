import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/constants/design-tokens";
import { Bell, CircleHelp, Shield } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { LanguageSegmentedControl } from "./LanguageSegmentedControl";
import { SettingsItem } from "./SettingsItem";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

interface SettingsContentProps {
	readonly onNotificationsPress: () => void;
	readonly onPrivacyPress: () => void;
	readonly onHelpPress: () => void;
}

export default function SettingsContent({
	onNotificationsPress,
	onPrivacyPress,
	onHelpPress,
}: SettingsContentProps) {
	const { t } = useTranslation("common");
	const { t: ts } = useTranslation("settings");

	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="gap-card-roomy px-screen-x py-stack-xl"
		>
			<View
				className="rounded-card bg-card px-card-roomy py-card"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="bodySm" className="mb-stack-md font-semibold text-content-secondary text-sm">
					{t("appearance")}
				</Text>
				<ThemeSegmentedControl />
			</View>

			<View
				className="rounded-card bg-card px-card-roomy py-card"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="bodySm" className="mb-stack-md font-semibold text-content-secondary text-sm">
					{t("language")}
				</Text>
				<LanguageSegmentedControl />
			</View>

			<View
				className="rounded-card bg-card px-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<SettingsItem
					icon={Bell}
					label={ts("menu.notifications")}
					onPress={onNotificationsPress}
				/>
				<Separator />
				<SettingsItem
					icon={Shield}
					label={ts("menu.privacy")}
					onPress={onPrivacyPress}
				/>
				<Separator />
				<SettingsItem
					icon={CircleHelp}
					label={ts("menu.help")}
					onPress={onHelpPress}
				/>
			</View>
		</ScrollView>
	);
}
