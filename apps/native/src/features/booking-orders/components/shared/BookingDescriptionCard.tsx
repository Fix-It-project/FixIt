import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly description: string;
}

export default function BookingDescriptionCard({ description }: Props) {
	const themeColors = useThemeColors();
	return (
		<View
			className="mb-4 rounded-2xl bg-surface p-4"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			<Text
				style={{
					fontFamily: "GoogleSans_600SemiBold",
					fontSize: 13,
					color: themeColors.textPrimary,
					marginBottom: 8,
				}}
			>
				Problem Description
			</Text>
			<Text
				style={{
					fontSize: 13,
					color: themeColors.textSecondary,
					lineHeight: 20,
				}}
			>
				{description}
			</Text>
		</View>
	);
}
