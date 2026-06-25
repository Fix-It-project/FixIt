import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { space, useThemeColors } from "@/src/constants/design-tokens";

interface PillStepIndicatorProps {
	readonly stepIndex: number;
	readonly stepCount: number;
}

interface PillSegmentProps {
	readonly state: "past" | "active" | "future";
	readonly pastColor: string;
	readonly inactiveColor: string;
	readonly activeColor: string;
	readonly reducedMotion: boolean;
}

function PillSegment({
	state,
	pastColor,
	inactiveColor,
	activeColor,
	reducedMotion,
}: PillSegmentProps) {
	const progress = useSharedValue(state === "active" ? 1 : 0);

	useEffect(() => {
		const target = state === "active" ? 1 : 0;
		if (reducedMotion) {
			progress.value = target;
			return;
		}
		progress.value = withTiming(target, { duration: 200 });
	}, [state, reducedMotion, progress]);

	const animatedStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.value,
			[0, 1],
			[inactiveColor, activeColor],
		),
	}));

	if (state === "past") {
		return (
			<View
				className="flex-1 rounded-pill"
				style={{ height: space[1.5], backgroundColor: pastColor }}
			/>
		);
	}

	return (
		<Animated.View
			className="flex-1 rounded-pill"
			style={[{ height: space[1.5] }, animatedStyle]}
		/>
	);
}

export default function PillStepIndicator({
	stepIndex,
	stepCount,
}: PillStepIndicatorProps) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();

	const segments = useMemo(() => {
		const list: Array<{
			stepNumber: number;
			state: "past" | "active" | "future";
		}> = [];
		for (let i = 1; i <= stepCount; i += 1) {
			let state: "past" | "active" | "future" = "future";
			if (i < stepIndex) state = "past";
			else if (i === stepIndex) state = "active";
			list.push({ stepNumber: i, state });
		}
		return list;
	}, [stepIndex, stepCount]);

	return (
		<View className="flex-row gap-stack-xs px-screen-x py-stack-md">
			{segments.map(({ stepNumber, state }) => (
				<PillSegment
					key={`pill-${stepNumber}`}
					state={state}
					pastColor={themeColors.primary}
					inactiveColor={themeColors.borderDefault}
					activeColor={themeColors.primary}
					reducedMotion={reducedMotion}
				/>
			))}
		</View>
	);
}
