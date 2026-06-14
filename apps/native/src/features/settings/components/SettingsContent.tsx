import { Bell, CircleHelp, MapPin, Shield, Wrench } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/constants/design-tokens";
import { LanguageSegmentedControl } from "./LanguageSegmentedControl";
import { SettingsItem } from "./SettingsItem";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

interface SettingsContentProps {
	readonly onNotificationsPress: () => void;
	readonly onPrivacyPress: () => void;
	readonly onHelpPress: () => void;
	/** Optional tech-only entry: edit the technician's service location. */
	readonly onAddressPress?: () => void;
	/** Optional tech-only entry: manage / request the services the technician offers. */
	readonly onServicesPress?: () => void;
}

export default function SettingsContent({
	onNotificationsPress,
	onPrivacyPress,
	onHelpPress,
	onAddressPress,
	onServicesPress,
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
				<Text
					variant="bodySm"
					className="mb-stack-md font-semibold text-content-secondary text-sm"
				>
					{t("appearance")}
				</Text>
				<ThemeSegmentedControl />
			</View>

			<View
				className="rounded-card bg-card px-card-roomy py-card"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text
					variant="bodySm"
					className="mb-stack-md font-semibold text-content-secondary text-sm"
				>
					{t("language")}
				</Text>
				<LanguageSegmentedControl />
			</View>

			<View
				className="rounded-card bg-card px-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				{onAddressPress ? (
					<>
						<SettingsItem
							icon={MapPin}
							label={ts("menu.address")}
							onPress={onAddressPress}
						/>
						<Separator />
					</>
				) : null}
				{onServicesPress ? (
					<>
						<SettingsItem
							icon={Wrench}
							label={ts("menu.services")}
							onPress={onServicesPress}
						/>
						<Separator />
					</>
				) : null}
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
