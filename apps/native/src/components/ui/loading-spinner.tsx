import { ActivityIndicator, View, type ViewProps } from "react-native";
import { useThemeColors } from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

type LoadingSpinnerProps = ViewProps & {
	readonly size?: "small" | "large";
	readonly color?: string;
};

export function LoadingSpinner({
	size = "small",
	color,
	className,
	...props
}: LoadingSpinnerProps) {
	const themeColors = useThemeColors();

	return (
		<View className={cn("items-center justify-center", className)} {...props}>
			<ActivityIndicator size={size} color={color ?? themeColors.primary} />
		</View>
	);
}
