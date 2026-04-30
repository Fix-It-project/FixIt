import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";

export function SettingsItem({
	icon: Icon,
	label,
	onPress,
}: Readonly<{
	icon: LucideIcon;
	label: string;
	onPress: () => void;
}>) {
	const themeColors = useThemeColors();

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="flex-row items-center gap-list-row py-list-row-comfortable-y"
		>
			<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill bg-app-primary-light">
				<Icon size={18} color={Colors.primary} strokeWidth={1.8} />
			</View>
			<Text variant="buttonLg" className="flex-1 text-content">
				{label}
			</Text>
			<ChevronRight
				size={18}
				color={themeColors.textSecondary}
				strokeWidth={1.8}
			/>
		</TouchableOpacity>
	);
}
