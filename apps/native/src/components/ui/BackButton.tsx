import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { cn } from "@/src/lib/utils";
import { useThemeColors } from "@/src/lib/theme";

type BackButtonVariant = "header" | "header-inverse" | "light" | "surface";

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
}

export default function BackButton({
	variant = "light",
	onPress,
	iconSize = 22,
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
		light: { bgClassName: "bg-overlay-md", iconColor: themeColors.onPrimaryHeader },
		surface: { bgClassName: "bg-surface-elevated", iconColor: themeColors.textPrimary },
	};
	const { bgClassName, iconColor } = variantStyles[variant];

	return (
		<TouchableOpacity
			onPress={onPress ?? (() => router.back())}
			activeOpacity={0.7}
			hitSlop={8}
			className={cn(
				"h-9 w-9 items-center justify-center rounded-full",
				bgClassName,
				className
			)}
			{...props}
		>
			<ChevronLeft size={iconSize} color={iconColor} strokeWidth={2.5} />
		</TouchableOpacity>
	);
}
