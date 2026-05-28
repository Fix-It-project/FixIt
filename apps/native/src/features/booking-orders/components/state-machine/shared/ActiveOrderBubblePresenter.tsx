// Presentational floating bubble for the active order.
//
// Owns: entrance spring, idle pulse (only when status === "tracking"),
// layout, accessibility, navigation tap surface.
//
// Has zero data dependencies. The user/tech wrappers
// (UserActiveOrderBubble / TechActiveOrderBubble) own the data hooks and
// pass already-resolved props.

import { Truck, Wrench } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import {
	EASE_OUT_EXPO,
	SPRING_SOFT,
} from "@/src/constants/animation";
import { elevation, shadowStyle } from "@/src/constants/design-tokens";
import { useBottomTabMetrics } from "@/src/components/layout/tab-bar";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";

interface ActiveOrderBubblePresenterProps {
	readonly active: Order | null;
	readonly etaMinutes: number | null;
	readonly viewer: "user" | "technician";
	readonly onPress: () => void;
}

const PULSE_DURATION_MS = 1400;
const PULSE_TARGET = 1.05;
const ENTRANCE_TRANSLATE_FROM = -100;
const ENTRANCE_SCALE_FROM = 0.6;
const ICON_SIZE = spacing.icon.sm;
const ICON_STROKE_WIDTH = 1.8;
const Z_INDEX = 10;

export default function ActiveOrderBubblePresenter({
	active,
	etaMinutes,
	viewer,
	onPress,
}: ActiveOrderBubblePresenterProps) {
	const themeColors = useThemeColors();
	const metrics = useBottomTabMetrics();
	const reducedMotion = useReducedMotion();

	const isActive = active != null;
	const isTracking = active?.status === "tracking";

	const translateX = useSharedValue(ENTRANCE_TRANSLATE_FROM);
	const scale = useSharedValue(ENTRANCE_SCALE_FROM);
	const pulse = useSharedValue(1);

	useEffect(() => {
		if (!isActive) {
			translateX.value = ENTRANCE_TRANSLATE_FROM;
			scale.value = ENTRANCE_SCALE_FROM;
			pulse.value = 1;
			return;
		}
		if (reducedMotion) {
			translateX.value = 0;
			scale.value = 1;
			pulse.value = 1;
			return;
		}
		translateX.value = withSpring(0, SPRING_SOFT);
		scale.value = withSpring(1, SPRING_SOFT);
		if (isTracking) {
			pulse.value = withRepeat(
				withTiming(PULSE_TARGET, {
					duration: PULSE_DURATION_MS,
					easing: EASE_OUT_EXPO,
				}),
				-1,
				true,
			);
		} else {
			pulse.value = 1;
		}
	}, [isActive, isTracking, reducedMotion, translateX, scale, pulse]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ translateX: translateX.value },
			{ scale: scale.value * pulse.value },
		],
	}));

	if (!isActive || !active) return null;

	const showEta = isTracking && typeof etaMinutes === "number";

	return (
		<View
			pointerEvents="box-none"
			style={{
				position: "absolute",
				left: spacing.screen.paddingX,
				bottom: metrics.tabBarHeight + spacing.stack.md,
				zIndex: Z_INDEX,
			}}
		>
			<Animated.View style={animatedStyle}>
				<PressableScale
					onPress={onPress}
					accessibilityRole="button"
					accessibilityLabel={
						viewer === "technician"
							? showEta
								? `Active job — arrives in about ${etaMinutes} minutes`
								: "Active job"
							: showEta
								? `Open active order — arrives in about ${etaMinutes} minutes`
								: "Open active order"
					}
					className="flex-row items-center gap-stack-xs rounded-pill bg-app-primary px-card py-stack-sm"
					style={shadowStyle(elevation.header, {
						shadowColor: themeColors.shadow,
						opacity: 0.18,
						radius: 8,
						android: 6,
					})}
				>
					{viewer === "technician" ? (
						<Wrench
							size={ICON_SIZE}
							color={Colors.surfaceBase}
							strokeWidth={ICON_STROKE_WIDTH}
						/>
					) : (
						<Truck
							size={ICON_SIZE}
							color={Colors.surfaceBase}
							strokeWidth={ICON_STROKE_WIDTH}
						/>
					)}
					{showEta ? (
						<Text variant="caption" style={{ color: themeColors.surfaceBase }}>
							{`~${etaMinutes}m`}
						</Text>
					) : null}
				</PressableScale>
			</Animated.View>
		</View>
	);
}
