import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { ActivityIndicator, Pressable } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

interface ProfileRowProps {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly onPress: () => void;
	/** Destructive rows (e.g. log out) render in the danger color. */
	readonly destructive?: boolean;
	readonly loading?: boolean;
	/** Hide the trailing chevron (e.g. terminal actions like log out). */
	readonly showChevron?: boolean;
}

/**
 * A flat, card-less profile/menu row sitting directly on the surface with a
 * comfortable touch target. Used for profile actions (edit, history, …).
 */
export default function ProfileRow({
	icon: Icon,
	label,
	onPress,
	destructive = false,
	loading = false,
	showChevron = true,
}: ProfileRowProps) {
	const themeColors = useThemeColors();
	const color = destructive ? themeColors.danger : themeColors.textPrimary;
	const iconColor = destructive
		? themeColors.danger
		: themeColors.textSecondary;

	return (
		<Pressable
			onPress={onPress}
			disabled={loading}
			accessibilityRole="button"
			className="flex-row items-center gap-stack-md px-screen-x py-list-row-comfortable-y active:opacity-70"
		>
			<Icon size={22} color={iconColor} strokeWidth={1.8} />
			<Text variant="body" className="flex-1" style={{ color }}>
				{label}
			</Text>
			{loading ? (
				<ActivityIndicator size="small" color={iconColor} />
			) : null}
			{!loading && showChevron ? (
				<ChevronRight
					size={20}
					color={themeColors.textMuted}
					strokeWidth={1.8}
				/>
			) : null}
		</Pressable>
	);
}
