import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

export default function OrdersHeader() {
	const themeColors = useThemeColors();
	return (
		<View
			className="px-4 pt-4 pb-4"
			style={{ backgroundColor: themeColors.surfaceBase, minHeight: 64 }}
		>
			<Text
				style={{
					fontFamily: "GoogleSans_700Bold",
					fontSize: 18,
					color: themeColors.textPrimary,
				}}
			>
				My Orders
			</Text>
		</View>
	);
}
