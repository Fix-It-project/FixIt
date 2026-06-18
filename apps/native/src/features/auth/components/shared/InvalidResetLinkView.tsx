import { type Href, router } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/src/components/ui/back-button";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText, Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/design-tokens";

interface InvalidResetLinkViewProps {
	readonly loginRoute: Href;
}

export default function InvalidResetLinkView({
	loginRoute,
}: InvalidResetLinkViewProps) {
	const { t } = useTranslation("auth");
	const insets = useSafeAreaInsets();
	return (
		<View className="flex-1 bg-surface">
			{/* Top Bar */}
			<View
				className="flex-row items-center px-card pb-stack-sm"
				style={{ paddingTop: insets.top + 8 }}
			>
				<BackButton variant="header" size="md" />
			</View>

			{/* Header */}
			<View className="mt-stack-sm mb-stack-xl px-screen-x">
				<Text variant="h2" className="mb-stack-sm text-content">
					{t("resetPassword.invalidTitle")}
				</Text>
				<Text variant="body" className="text-content-secondary">
					{t("resetPassword.invalidSubtitle")}
				</Text>
			</View>

			{/* Icon */}
			<View className="mt-stack-xl items-center">
				<View className="h-avatar-hero w-avatar-hero items-center justify-center rounded-pill bg-danger-soft">
					<AlertCircle size={40} color={Colors.danger} />
				</View>
				<Text
					variant="bodySm"
					className="mt-stack-lg px-screen-bottom-inset text-center text-content-secondary"
				>
					{t("resetPassword.invalidBody")}
				</Text>
			</View>

			{/* Spacer */}
			<View className="flex-1" />

			{/* Bottom Button */}
			<View
				className="px-screen-x"
				style={{ paddingBottom: insets.bottom + 16 }}
			>
				<Button
					variant="outline"
					onPress={() => router.replace(loginRoute)}
					className="border-app-primary border-selected"
				>
					<BtnText variant="buttonLg" className="text-app-primary">
						{t("resetPassword.backToLogin")}
					</BtnText>
				</Button>
			</View>
		</View>
	);
}
