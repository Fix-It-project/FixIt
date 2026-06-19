import { Image } from "expo-image";
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";

// PNG logo (same asset the native splash + LaunchSplashOverlay use). The SVG
// wordmark didn't animate cleanly under the cropped viewBox, so we render the
// square PNG and animate the wrapper instead.
const splashLogo = require("@/src/assets/images/splash-logo.png");

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

	return (
		<Animated.View style={animatedStyle}>
			<Image
				source={splashLogo}
				style={{ width, height: width }}
				contentFit="contain"
				accessibilityLabel="Fix It"
			/>
		</Animated.View>
	);
}
