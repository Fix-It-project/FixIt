import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { Button } from "@/src/components/ui/button";
import { useThemeColors } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";

type BackButtonVariant = "header" | "header-inverse" | "light" | "surface";
type BackButtonSize = "sm" | "md";

interface BackButtonProps {
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
	readonly className?: string;
	readonly accessibilityLabel?: string;
	/** Pass-through style for layout positioning (e.g. marginTop). */
	readonly style?: StyleProp<ViewStyle>;
}

export default function BackButton({
	variant = "light",
	onPress,
	iconSize = 22,
	size = "sm",
	className,
	accessibilityLabel = "Go back",
	style,
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

	// canonical size="icon" gives h-control-back-md; override for sm
	const sizeClassName =
		size === "sm" ? "h-control-back-sm w-control-back-sm" : undefined;

	return (
		<Button
			variant="ghost"
			size="icon"
			onPress={onPress ?? (() => router.back())}
			accessibilityLabel={accessibilityLabel}
			className={cn(sizeClassName, bgClassName, className)}
			style={style}
		>
			<ChevronLeft size={iconSize} color={iconColor} strokeWidth={2.5} />
		</Button>
	);
}
