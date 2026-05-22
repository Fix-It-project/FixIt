import type { ReactNode } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabMetrics } from "@/src/lib/tab-bar-config";
import { spacing, useThemeColors } from "@/src/lib/theme";

interface StickyBottomCTAProps {
	readonly children: ReactNode;
	readonly withTabBar?: boolean;
	readonly onLayout?: (event: LayoutChangeEvent) => void;
}

export default function StickyBottomCTA({
	children,
	withTabBar = false,
	onLayout,
}: StickyBottomCTAProps) {
	const insets = useSafeAreaInsets();
	const metrics = useBottomTabMetrics();
	const themeColors = useThemeColors();

	const bottomOffset = insets.bottom + (withTabBar ? metrics.tabBarHeight : 0);

	return (
		<View
			onLayout={onLayout}
			style={{
				position: "absolute",
				left: 0,
				right: 0,
				bottom: bottomOffset,
				paddingHorizontal: spacing.screen.paddingX,
				paddingVertical: spacing.stack.md,
				backgroundColor: themeColors.surfaceBase,
			}}
		>
			{children}
		</View>
	);
}
