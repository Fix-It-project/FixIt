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
				variant="buttonMd"
				className="mb-2"
				style={{ color: themeColors.textPrimary }}
			>
				Problem Description
			</Text>
			<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
				{description}
			</Text>
		</View>
	);
}
