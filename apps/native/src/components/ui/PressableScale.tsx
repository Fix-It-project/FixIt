import { Pressable, type PressableProps } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
	pressedScale?: number;
}

export function PressableScale({
	pressedScale = 0.96,
	onPressIn,
	onPressOut,
	style,
	children,
	...rest
}: PressableScaleProps) {
	const reducedMotion = useReducedMotion();
	const scale = useSharedValue(1);
	const opacity = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		opacity: opacity.value,
	}));

	return (
		<AnimatedPressable
			{...rest}
			onPressIn={(e) => {
				if (reducedMotion) {
					opacity.value = withTiming(0.85, { duration: 80 });
				} else {
					scale.value = withTiming(pressedScale, {
						duration: 80,
						easing: Easing.out(Easing.cubic),
					});
				}
				onPressIn?.(e);
			}}
			onPressOut={(e) => {
				if (reducedMotion) {
					opacity.value = withTiming(1, { duration: 120 });
				} else {
					scale.value = withTiming(1, {
						duration: 110,
						easing: Easing.out(Easing.cubic),
					});
				}
				onPressOut?.(e);
			}}
			style={[animatedStyle, style as object]}
		>
			{children}
		</AnimatedPressable>
	);
}
