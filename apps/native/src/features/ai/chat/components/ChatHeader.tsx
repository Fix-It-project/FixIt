import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

export default function ChatHeader() {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();

	return (
		<View
			className="px-screen-x pt-stack-md pb-stack-sm"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<Text
				variant="bodyLg"
				className="font-google-sans-bold"
				style={{ color: themeColors.textPrimary }}
			>
				{t("header.title")}
			</Text>
		</View>
	);
}
