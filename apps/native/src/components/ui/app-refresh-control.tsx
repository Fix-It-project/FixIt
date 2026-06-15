import { RefreshControl, type RefreshControlProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/constants/design-tokens";

type AppRefreshControlProps = RefreshControlProps & {
	readonly useTopInset?: boolean;
};

export function AppRefreshControl({
	colors,
	tintColor,
	progressViewOffset,
	useTopInset = false,
	...props
}: AppRefreshControlProps) {
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();
	const indicatorColor = tintColor ?? themeColors.primary;

	return (
		<RefreshControl
			colors={colors ?? [indicatorColor]}
			tintColor={indicatorColor}
			progressViewOffset={
				progressViewOffset ?? (useTopInset ? insets.top : undefined)
			}
			{...props}
		/>
	);
}
