import { MessageCircle } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";

export default function ChatHeader() {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();

	return (
		<View
			className="px-5 pt-6 pb-4"
			style={{
				backgroundColor: themeColors.surfaceBase,
				borderBottomWidth: 1,
				borderBottomColor: themeColors.borderDefault,
			}}
		>
			<View className="flex-row items-center">
				<View
					className="h-11 w-11 items-center justify-center rounded-2xl"
					style={{ backgroundColor: themeColors.primaryLight }}
				>
					<MessageCircle size={20} color={Colors.primary} strokeWidth={2} />
				</View>
				<View className="ml-3 flex-1">
					<Text
						variant="bodyLg"
						className="font-google-sans-bold"
						style={{ color: themeColors.textPrimary }}
					>
						{t("header.title")}
					</Text>
					<Text
						variant="bodySm"
						className="mt-1"
						style={{ color: themeColors.textSecondary }}
					>
						{t("header.subtitle")}
					</Text>
				</View>
			</View>
		</View>
	);
}
