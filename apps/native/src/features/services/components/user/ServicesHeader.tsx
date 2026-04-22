import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import BackButton from "@/src/components/ui/BackButton";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

interface ServicesHeaderProps {
	readonly categoryName: string;
	readonly categoryColor: string;
	readonly CategoryIcon: LucideIcon;
	readonly onBackPress?: () => void;
}

export default function ServicesHeader({
	categoryName,
	categoryColor,
	CategoryIcon,
	onBackPress,
}: ServicesHeaderProps) {
	const themeColors = useThemeColors();
	return (
		<View style={{ backgroundColor: categoryColor }} className="pb-5">
			<View className="flex-row items-center px-4 pt-2 pb-1">
				<BackButton
					variant="header-inverse"
					className="mr-3"
					onPress={onBackPress}
				/>
				<View className="flex-1">
					<Text
						variant="h3"
						style={{ color: themeColors.onPrimaryHeader }}
						numberOfLines={1}
					>
						{categoryName}
					</Text>
					<Text variant="caption" style={{ color: themeColors.overlayBright }}>
						Choose a service
					</Text>
				</View>
				<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-full bg-overlay-md">
					<CategoryIcon
						size={20}
						color={themeColors.onPrimaryHeader}
						strokeWidth={1.75}
					/>
				</View>
			</View>
		</View>
	);
}
