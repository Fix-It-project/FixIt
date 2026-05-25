import { ChevronRight } from "lucide-react-native";
import { Button } from "@/src/components/ui/button";
import { useThemeColors } from "@/src/lib/theme";

interface SectionEndArrowProps {
	readonly onPress?: () => void;
}

export default function SectionFooterArrow({ onPress }: SectionEndArrowProps) {
	const themeColors = useThemeColors();
	return (
		<Button
			variant="primary"
			size="icon"
			onPress={onPress}
			accessibilityLabel="See all"
			className="ml-stack-xs h-control-icon-box-touch w-control-icon-box-touch rounded-pill"
			iconLeft={
				<ChevronRight
					size={26}
					color={themeColors.surfaceBase}
					strokeWidth={2.5}
				/>
			}
		/>
	);
}
