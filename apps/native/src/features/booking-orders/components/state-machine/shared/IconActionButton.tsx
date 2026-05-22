import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, View } from "react-native";
import { PressableScale } from "@/src/components/ui/PressableScale";
import { radius, spacing, useThemeColors } from "@/src/lib/theme";

type IconActionTone = "neutral" | "danger";

interface IconActionButtonProps {
	readonly icon: LucideIcon;
	readonly onPress: () => void;
	readonly tone?: IconActionTone;
	readonly accessibilityLabel: string;
	readonly disabled?: boolean;
	readonly pending?: boolean;
	readonly size?: number;
}

export default function IconActionButton({
	icon: Icon,
	onPress,
	tone = "neutral",
	accessibilityLabel,
	disabled,
	pending,
	size = 52,
}: IconActionButtonProps) {
	const themeColors = useThemeColors();
	const isDanger = tone === "danger";
	const bg = isDanger
		? `${themeColors.danger}1A`
		: themeColors.surfaceElevated;
	const fg = isDanger ? themeColors.danger : themeColors.textPrimary;

	return (
		<PressableScale
			onPress={onPress}
			disabled={disabled || pending}
			accessibilityRole="button"
			accessibilityLabel={accessibilityLabel}
			accessibilityState={{ disabled: disabled || pending }}
		>
			<View
				style={{
					width: size,
					height: size,
					alignItems: "center",
					justifyContent: "center",
					borderRadius: radius.button,
					backgroundColor: bg,
				}}
			>
				{pending ? (
					<ActivityIndicator size="small" color={fg} />
				) : (
					<Icon size={spacing.icon.sm} color={fg} strokeWidth={2.4} />
				)}
			</View>
		</PressableScale>
	);
}

export type { IconActionTone };
