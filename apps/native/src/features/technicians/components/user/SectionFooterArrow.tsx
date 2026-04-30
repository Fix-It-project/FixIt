import { ChevronRight } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/src/lib/theme";

interface SectionEndArrowProps {
	readonly onPress?: () => void;
}

export default function SectionFooterArrow({ onPress }: SectionEndArrowProps) {
	const themeColors = useThemeColors();
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="ml-stack-xs w-avatar-lg items-center justify-center"
		>
			<View className="h-control-icon-box-touch w-control-icon-box-touch items-center justify-center rounded-pill bg-app-primary">
				<ChevronRight
					size={26}
					color={themeColors.surfaceBase}
					strokeWidth={2.5}
				/>
			</View>
		</TouchableOpacity>
	);
}
