import type { ReactNode } from "react";
import { useEffect } from "react";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { EASE_OUT_EXPO } from "@/src/lib/animation/constants";

interface StepBodySlideProps {
	readonly slideKey: string;
	readonly children: ReactNode;
}

const ENTER_TRANSLATE_X = 28;
const TRANSLATE_DURATION_MS = 260;
const OPACITY_DURATION_MS = 220;

export default function StepBodySlide({
	slideKey,
	children,
}: StepBodySlideProps) {
	const reducedMotion = useReducedMotion();
	const enterOpacity = useSharedValue(reducedMotion ? 1 : 0);
	const enterTranslateX = useSharedValue(reducedMotion ? 0 : ENTER_TRANSLATE_X);

	useEffect(() => {
		if (reducedMotion) {
			enterOpacity.value = 1;
			enterTranslateX.value = 0;
			return;
		}
		enterOpacity.value = 0;
		enterTranslateX.value = ENTER_TRANSLATE_X;
		enterOpacity.value = withTiming(1, {
			duration: OPACITY_DURATION_MS,
			easing: EASE_OUT_EXPO,
		});
		enterTranslateX.value = withTiming(0, {
			duration: TRANSLATE_DURATION_MS,
			easing: EASE_OUT_EXPO,
		});
	}, [slideKey, reducedMotion, enterOpacity, enterTranslateX]);

	const entryStyle = useAnimatedStyle(() => ({
		opacity: enterOpacity.value,
		transform: [{ translateX: enterTranslateX.value }],
	}));

	return (
		<Animated.View style={entryStyle} className="flex-1">
			{children}
		</Animated.View>
	);
}
