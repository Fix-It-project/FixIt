import { Image } from "expo-image";
import * as React from "react";
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

const fxtAsset = require("@/src/assets/onboarding/fxt.png");

interface BrandMarkProps {
	width: number;
	reveal: SharedValue<number>;
	collapse: SharedValue<number>;
	collapsedScale?: number;
}

export function BrandMark({
	width,
	reveal,
	collapse,
	collapsedScale = 0.78,
}: BrandMarkProps) {
	const animatedStyle = useAnimatedStyle(() => {
		const revealOpacity = reveal.value;
		const revealScale = interpolate(reveal.value, [0, 1], [0.92, 1]);
		const collapseScaleVal = interpolate(
			collapse.value,
			[0, 1],
			[1, collapsedScale],
		);
		return {
			opacity: revealOpacity,
			transform: [{ scale: revealScale * collapseScaleVal }],
		};
	});

	const height = width;

	return (
		<Animated.View style={animatedStyle}>
			<Image
				source={fxtAsset}
				style={{ width, height }}
				contentFit="contain"
				transition={0}
				accessible
				accessibilityLabel="Fix It"
			/>
		</Animated.View>
	);
}
