import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { type LayoutChangeEvent, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

const TRACK_HEIGHT = 6;
const SEGMENT_RATIO = 0.4;

/**
 * Card-less indeterminate progress for the "inspecting" stage — replaces the
 * old system `ActivityIndicator` spinner with a calmer Material-style sweeping
 * bar in the primary tint. Falls back to a static partial bar when the user has
 * reduced motion enabled.
 */
export default function InspectionProgress() {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const progress = useSharedValue(0);
	const [trackWidth, setTrackWidth] = useState(0);

	useEffect(() => {
		if (reducedMotion) return;
		progress.value = withRepeat(
			withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
			-1,
			false,
		);
	}, [reducedMotion, progress]);

	const segmentStyle = useAnimatedStyle(() => {
		const segmentWidth = trackWidth * SEGMENT_RATIO;
		const travel = trackWidth + segmentWidth;
		return {
			transform: [{ translateX: -segmentWidth + progress.value * travel }],
		};
	});

	const handleLayout = (e: LayoutChangeEvent) => {
		setTrackWidth(e.nativeEvent.layout.width);
	};

	return (
		<View style={{ gap: space[2] }}>
			<Text
				variant="bodySm"
				className="font-google-sans-bold"
				style={{ color: themeColors.primary }}
			>
				{t("detail.arrived.inspecting")}
			</Text>
			<View
				onLayout={handleLayout}
				style={{
					height: TRACK_HEIGHT,
					borderRadius: radius.pill,
					backgroundColor: `${themeColors.primary}1f`,
					overflow: "hidden",
				}}
			>
				{reducedMotion ? (
					<View
						style={{
							position: "absolute",
							top: 0,
							bottom: 0,
							left: 0,
							width: `${SEGMENT_RATIO * 100}%`,
							borderRadius: radius.pill,
							backgroundColor: themeColors.primary,
						}}
					/>
				) : (
					<Animated.View
						style={[
							{
								position: "absolute",
								top: 0,
								bottom: 0,
								width: `${SEGMENT_RATIO * 100}%`,
								borderRadius: radius.pill,
								backgroundColor: themeColors.primary,
							},
							segmentStyle,
						]}
					/>
				)}
			</View>
		</View>
	);
}
