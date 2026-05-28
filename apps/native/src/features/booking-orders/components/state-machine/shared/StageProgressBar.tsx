import { useEffect, useMemo, useState } from "react";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
	Easing,
	interpolateColor,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

interface StageProgressBarProps {
	readonly stepIndex: number;
	readonly stepCount: number;
	readonly labels?: readonly string[];
}

const BAR_GAP = 8;

function Segment({
	idx,
	stepIndex,
	primary,
	track,
	reducedMotion,
}: {
	idx: number;
	stepIndex: number;
	primary: string;
	track: string;
	reducedMotion: boolean;
}) {
	const target = idx <= stepIndex ? 1 : 0;
	const fill = useSharedValue(target);

	useEffect(() => {
		if (reducedMotion) {
			fill.value = target;
			return;
		}
		fill.value = withDelay(
			idx * 60,
			withTiming(target, {
				duration: 280,
				easing: Easing.out(Easing.cubic),
			}),
		);
	}, [target, reducedMotion, idx, fill]);

	const trackStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(fill.value, [0, 1], [track, primary]),
	}));

	return (
		<View style={{ flex: 1, height: 5 }}>
			<View
				style={{
					position: "absolute",
					inset: 0,
					borderRadius: radius.pill,
					backgroundColor: track,
				}}
			/>
			<Animated.View
				style={[
					{
						position: "absolute",
						inset: 0,
						borderRadius: radius.pill,
					},
					trackStyle,
				]}
			/>
		</View>
	);
}

export default function StageProgressBar({
	stepIndex,
	stepCount,
	labels,
}: StageProgressBarProps) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const [containerWidth, setContainerWidth] = useState(0);
	const [labelWidth, setLabelWidth] = useState(0);

	const indices = useMemo(
		() => Array.from({ length: stepCount }, (_, i) => i + 1),
		[stepCount],
	);

	const activeLabel = labels?.[stepIndex - 1] ?? null;

	// Centre the absolutely-positioned label over the active segment.
	const segmentWidth =
		containerWidth > 0
			? (containerWidth - BAR_GAP * (stepCount - 1)) / stepCount
			: 0;
	const labelCenter =
		(stepIndex - 1) * (segmentWidth + BAR_GAP) + segmentWidth / 2;
	const labelLeft = Math.max(0, labelCenter - labelWidth / 2);
	const labelClampedLeft =
		containerWidth > 0 && labelWidth > 0
			? Math.min(labelLeft, containerWidth - labelWidth)
			: labelLeft;

	const handleContainerLayout = (e: LayoutChangeEvent) => {
		setContainerWidth(e.nativeEvent.layout.width);
	};

	const handleLabelLayout = (e: LayoutChangeEvent) => {
		setLabelWidth(e.nativeEvent.layout.width);
	};

	return (
		<View
			style={{
				paddingHorizontal: space[4],
				paddingTop: space[2],
				paddingBottom: space[2],
				gap: space[2],
			}}
		>
			<View
				onLayout={handleContainerLayout}
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: BAR_GAP,
				}}
			>
				{indices.map((i) => (
					<Segment
						key={i}
						idx={i}
						stepIndex={stepIndex}
						primary={themeColors.primary}
						track={themeColors.borderDefault}
						reducedMotion={reducedMotion}
					/>
				))}
			</View>
			{activeLabel ? (
				<View style={{ height: 14 }}>
					<View
						onLayout={handleLabelLayout}
						style={{
							position: "absolute",
							left: labelClampedLeft,
							opacity: containerWidth > 0 ? 1 : 0,
						}}
					>
						<Text
							variant="caption"
							className="font-google-sans-bold"
							style={{ color: themeColors.primary }}
							numberOfLines={1}
						>
							{activeLabel}
						</Text>
					</View>
				</View>
			) : null}
		</View>
	);
}
