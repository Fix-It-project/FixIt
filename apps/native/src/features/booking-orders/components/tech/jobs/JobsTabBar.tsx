import { useCallback } from "react";
import { type LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
	type SharedValue,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

export interface JobsTabDef<T extends string> {
	readonly key: T;
	readonly label: string;
	readonly count?: number;
}

interface JobsTabBarProps<T extends string> {
	readonly tabs: readonly JobsTabDef<T>[];
	readonly active: T;
	readonly onChange: (key: T, index: number) => void;
	/** Fractional pager position (0..n-1) that drives the sliding underline so it
	 *  follows the finger during a swipe and settles on tap. */
	readonly position: SharedValue<number>;
}

/** Minimalist Material tab bar: equal segments with a sliding blue underline. */
export function JobsTabBar<T extends string>({
	tabs,
	active,
	onChange,
	position,
}: JobsTabBarProps<T>) {
	const themeColors = useThemeColors();
	const containerWidth = useSharedValue(0);

	const onLayout = useCallback(
		(e: LayoutChangeEvent) => {
			containerWidth.value = e.nativeEvent.layout.width;
		},
		[containerWidth],
	);

	const indicatorStyle = useAnimatedStyle(() => {
		const w = containerWidth.value / Math.max(1, tabs.length);
		return {
			width: w,
			transform: [{ translateX: position.value * w }],
		};
	});

	return (
		<View onLayout={onLayout}>
			<View className="flex-row">
				{tabs.map((tab, index) => {
					const isActive = tab.key === active;
					return (
						<Pressable
							key={tab.key}
							onPress={() => onChange(tab.key, index)}
							className="flex-1 flex-row items-center justify-center gap-1 py-stack-sm"
							accessibilityRole="tab"
							accessibilityState={{ selected: isActive }}
						>
							<Text
								variant="buttonMd"
								className={
									isActive ? "font-bold text-app-primary" : "text-content-muted"
								}
								numberOfLines={1}
							>
								{tab.label}
							</Text>
							{tab.count ? (
								<Text
									variant="caption"
									className={
										isActive
											? "font-bold text-app-primary"
											: "text-content-muted"
									}
								>
									{tab.count}
								</Text>
							) : null}
						</Pressable>
					);
				})}
			</View>
			{/* faint full-width track + sliding blue indicator on top */}
			<View
				className="h-px w-full"
				style={{ backgroundColor: themeColors.borderDefault }}
			/>
			<Animated.View
				style={[
					{
						height: 2,
						marginTop: -2,
						borderRadius: 999,
						backgroundColor: themeColors.primary,
					},
					indicatorStyle,
				]}
			/>
		</View>
	);
}
