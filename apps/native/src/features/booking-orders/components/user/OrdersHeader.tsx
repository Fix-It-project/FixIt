import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

export default function OrdersHeader() {
	const themeColors = useThemeColors();
	return (
		<View
			className="min-h-header px-screen-x pt-card pb-card"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<Text variant="h3" style={{ color: themeColors.textPrimary }}>
				My Orders
			</Text>
		</View>
	);
}
