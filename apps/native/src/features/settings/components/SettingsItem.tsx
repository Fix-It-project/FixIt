import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

export function SettingsItem({
	icon: Icon,
	label,
	onPress,
	rightText,
	destructive = false,
	hideChevron = false,
}: Readonly<{
	icon: LucideIcon;
	label: string;
	onPress: () => void;
	/** Optional value shown on the right (e.g. the active theme / language). */
	rightText?: string;
	/** Destructive actions (e.g. delete account, log out) render in danger. */
	destructive?: boolean;
	/** Hide the trailing chevron (e.g. terminal actions). */
	hideChevron?: boolean;
}>) {
	const themeColors = useThemeColors();
	const labelColor = destructive ? themeColors.danger : undefined;
	const iconColor = destructive
		? themeColors.danger
		: themeColors.textSecondary;

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="flex-row items-center gap-list-row py-list-row-comfortable-y"
		>
			<Icon size={22} color={iconColor} strokeWidth={1.8} />
			<Text
				variant="buttonLg"
				className="flex-1 text-content"
				style={labelColor ? { color: labelColor } : undefined}
			>
				{label}
			</Text>
			{rightText ? (
				<Text variant="bodySm" className="text-content-muted">
					{rightText}
				</Text>
			) : null}
			{!hideChevron ? (
				<ChevronRight
					size={18}
					color={themeColors.textSecondary}
					strokeWidth={1.8}
				/>
			) : null}
		</TouchableOpacity>
	);
}
