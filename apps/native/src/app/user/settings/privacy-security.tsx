import { Shield } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, elevation, shadowStyle } from "@/src/constants/design-tokens";

export default function PrivacySecurityScreen() {
	const { t } = useTranslation("settings");
	return (
		<ScrollView
			className="flex-1 bg-surface"
			contentContainerClassName="px-screen-x py-stack-xl gap-stack-lg"
		>
			<View
				className="rounded-card bg-card px-card-roomy py-stack-xl"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<View className="mb-stack-lg h-avatar-lg w-avatar-lg items-center justify-center rounded-pill bg-app-primary-light">
					<Shield size={28} color={Colors.primary} strokeWidth={1.8} />
				</View>
				<Text variant="bodyLg" className="font-bold text-content">
					{t("privacy.title")}
				</Text>
				<Text variant="bodySm" className="mt-stack-sm text-content-muted">
					{t("privacy.description")}
				</Text>
			</View>

			<View
				className="rounded-card bg-card px-card-roomy py-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="buttonLg" className="text-content">
					{t("privacy.dataTitle")}
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					{t("privacy.dataBody")}
				</Text>
			</View>

			<View
				className="rounded-card bg-card px-card-roomy py-card-roomy"
				style={shadowStyle(elevation.raised, { shadowColor: Colors.shadow })}
			>
				<Text variant="buttonLg" className="text-content">
					{t("privacy.useTitle")}
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content-muted">
					{t("privacy.useBody")}
				</Text>
			</View>
		</ScrollView>
	);
}
