import { useEffect, useState } from "react";
import {
	cancelAnimation,
	Easing,
	runOnJS,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

/**
 * Animates a number from its previous value to `target` and returns the
 * rounded in-flight value for rendering. Respects nothing fancier than a
 * timing curve — cheap enough for several instances per screen.
 */
export function useCountUp(target: number, durationMs = 800): number {
	const progress = useSharedValue(0);
	const [display, setDisplay] = useState(0);

	useEffect(() => {
		cancelAnimation(progress);
		progress.value = withTiming(target, {
			duration: durationMs,
			easing: Easing.out(Easing.cubic),
		});
	}, [target, durationMs, progress]);

	useDerivedValue(() => {
		runOnJS(setDisplay)(Math.round(progress.value));
	});

	return display;
}
