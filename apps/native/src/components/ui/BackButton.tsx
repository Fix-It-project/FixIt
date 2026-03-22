import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { cn } from "@/src/lib/utils";
import { Colors } from "@/src/lib/colors";

type BackButtonVariant = "light" | "surface";

interface BackButtonProps extends Omit<TouchableOpacityProps, "children"> {
	/** "light" → translucent white circle (on brand/dark headers).
	 *  "surface" → gray circle (on white/light pages). */
	variant?: BackButtonVariant;
	/** Override the default `router.back()` behaviour */
	onPress?: () => void;
	/** Icon size, default 22 */
	iconSize?: number;
}

const variantStyles: Record<BackButtonVariant, { bg: string; iconColor: string }> = {
	light: { bg: "bg-overlay-md", iconColor: Colors.white },
	surface: { bg: "bg-surface-gray", iconColor: Colors.textPrimary },
};

export default function BackButton({
	variant = "light",
	onPress,
	iconSize = 22,
	className,
	...props
}: BackButtonProps) {
	const { bg, iconColor } = variantStyles[variant];

	return (
		<TouchableOpacity
			onPress={onPress ?? (() => router.back())}
			activeOpacity={0.7}
			className={cn(
				"h-9 w-9 items-center justify-center rounded-full",
				bg,
				className
			)}
			{...props}
		>
			<ChevronLeft size={iconSize} color={iconColor} strokeWidth={2.5} />
		</TouchableOpacity>
	);
}
