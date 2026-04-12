import { ChevronRight } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/lib/theme";

interface SectionEndArrowProps {
	onPress?: () => void;
}

export default function SectionFooterArrow({ onPress }: SectionEndArrowProps) {
	const themeColors = useThemeColors();
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="ml-1 w-14 items-center justify-center"
		>
			<View className="h-11 w-11 items-center justify-center rounded-full bg-app-primary">
				<ChevronRight
					size={26}
					color={themeColors.surfaceBase}
					strokeWidth={2.5}
				/>
			</View>
		</TouchableOpacity>
	);
}
