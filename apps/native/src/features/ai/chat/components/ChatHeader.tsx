import { useTranslation } from "react-i18next";
import { Image, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

const fxtLogo = require("@/src/assets/onboarding/fxt.png");

export default function ChatHeader() {
	const { t } = useTranslation("chat");
	const themeColors = useThemeColors();

	return (
		<View
			className="flex-row items-center px-screen-x pt-stack-md pb-stack-sm"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<View
				className="h-10 w-10 items-center justify-center rounded-2xl"
				style={{ backgroundColor: themeColors.primaryLight }}
			>
				<Image
					source={fxtLogo}
					resizeMode="contain"
					style={{ width: 24, height: 24, tintColor: themeColors.primary }}
				/>
			</View>
			<Text
				variant="body"
				className="ml-stack-sm flex-1 font-google-sans-bold"
				style={{ color: themeColors.textPrimary }}
			>
				{t("header.title")}
			</Text>
		</View>
	);
}
