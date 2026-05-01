import { CircleHelp, Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/lib/theme";
import { SettingsItem } from "./SettingsItem";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

interface SettingsContentProps {
	readonly onPrivacyPress: () => void;
	readonly onHelpPress: () => void;
}

export default function SettingsContent({
	onPrivacyPress,
	onHelpPress,
}: SettingsContentProps) {
	return (
		<ScrollView
			className="flex-1 bg-surface-elevated"
			contentContainerClassName="gap-card-roomy px-screen-x py-stack-xl"
		>
			<View
				className="rounded-card bg-surface px-card-roomy py-card"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="bodySm" className="mb-stack-md font-semibold text-content-secondary text-sm">
					Appearance
				</Text>
				<ThemeSegmentedControl />
			</View>

			<View
				className="rounded-card bg-surface px-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<SettingsItem
					icon={Shield}
					label="Privacy & Security"
					onPress={onPrivacyPress}
				/>
				<Separator />
				<SettingsItem
					icon={CircleHelp}
					label="Help & Support"
					onPress={onHelpPress}
				/>
			</View>
		</ScrollView>
	);
}
