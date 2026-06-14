import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import FixItWordmark from "@/src/assets/images/fixittext.svg";

// The wordmark's text glyphs occupy this band of the 1536x1024 artboard; cropping
// to it removes the surrounding whitespace so width/height frame the logo tightly.
const WORDMARK_VIEWBOX = "360 405 800 220";
// Cropped wordmark aspect (~800:220) — height follows width instead of being square.
const WORDMARK_RATIO = 0.28;

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
			<FixItWordmark
				width={width}
				height={width * WORDMARK_RATIO}
				viewBox={WORDMARK_VIEWBOX}
				accessibilityLabel="Fix It"
			/>
		</Animated.View>
	);
}
