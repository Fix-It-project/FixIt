import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { useThemeColors } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";

type BackButtonVariant = "header" | "header-inverse" | "light" | "surface";
type BackButtonSize = "sm" | "md";

interface BackButtonProps extends Omit<TouchableOpacityProps, "children"> {
	/** "header" → transparent icon button on surface headers.
	 *  "header-inverse" → transparent icon button on brand headers.
	 *  "light" → translucent white circle on brand/dark headers.
	 *  "surface" → gray circle on white/light pages. */
	readonly variant?: BackButtonVariant;
	/** Override the default `router.back()` behaviour */
	readonly onPress?: () => void;
	/** Icon size, default 22 */
	readonly iconSize?: number;
	/** Shared back-button shell size. */
	readonly size?: BackButtonSize;
}

export default function BackButton({
	variant = "light",
	onPress,
	iconSize = 22,
	size = "sm",
	className,
	...props
}: Readonly<BackButtonProps>) {
	const themeColors = useThemeColors();
	const variantStyles: Record<
		BackButtonVariant,
		{ bgClassName?: string; iconColor: string }
	> = {
		header: { iconColor: themeColors.textPrimary },
		"header-inverse": { iconColor: themeColors.onPrimaryHeader },
		light: {
			bgClassName: "bg-overlay-md",
			iconColor: themeColors.onPrimaryHeader,
		},
		surface: {
			bgClassName: "bg-surface-elevated",
			iconColor: themeColors.textPrimary,
		},
	};
	const { bgClassName, iconColor } = variantStyles[variant];
	const sizeClassName =
		size === "md"
			? "h-control-back-md w-control-back-md"
			: "h-control-back-sm w-control-back-sm";

	return (
		<TouchableOpacity
			onPress={onPress ?? (() => router.back())}
			activeOpacity={0.7}
			hitSlop={8}
			className={cn(
				"items-center justify-center rounded-pill",
				sizeClassName,
				bgClassName,
				className,
			)}
			{...props}
		>
			<ChevronLeft size={iconSize} color={iconColor} strokeWidth={2.5} />
		</TouchableOpacity>
	);
}
