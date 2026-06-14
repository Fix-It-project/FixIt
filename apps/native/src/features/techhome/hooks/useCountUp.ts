import { useEffect, useState } from "react";
import {
	cancelAnimation,
	Easing,
	runOnJS,
	useAnimatedReaction,
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

	// Reacts to the shared value AFTER mount (unlike useDerivedValue, whose worklet
	// runs synchronously during the first render — calling setState there triggers
	// "state update on a component that hasn't mounted yet"). Only fires on change.
	useAnimatedReaction(
		() => Math.round(progress.value),
		(current, previous) => {
			if (current !== previous) {
				runOnJS(setDisplay)(current);
			}
		},
	);

	return display;
}
