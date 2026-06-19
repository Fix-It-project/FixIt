import { Image } from "expo-image";
import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withSequence,
	withTiming,
} from "react-native-reanimated";

const splashLogo = require("@/src/assets/images/fixittext.png");

interface LaunchSplashOverlayProps {
	readonly backgroundColor: string;
	readonly onFinish: () => void;
}

export function LaunchSplashOverlay({
	backgroundColor,
	onFinish,
}: LaunchSplashOverlayProps) {
	const { width } = useWindowDimensions();
	const opacity = useSharedValue(1);
	const scale = useSharedValue(0.96);
	const translateY = useSharedValue(8);
	const logoWidth = Math.min(width * 0.58, 260);

	useEffect(() => {
		scale.value = withSequence(
			withTiming(1, {
				duration: 260,
				easing: Easing.out(Easing.cubic),
			}),
			withDelay(
				170,
				withTiming(1.025, {
					duration: 280,
					easing: Easing.inOut(Easing.cubic),
				}),
			),
		);
		translateY.value = withTiming(0, {
			duration: 260,
			easing: Easing.out(Easing.cubic),
		});
		opacity.value = withDelay(
			420,
			withTiming(
				0,
				{
					duration: 280,
					easing: Easing.out(Easing.cubic),
				},
				(finished) => {
					if (finished) {
						runOnJS(onFinish)();
					}
				},
			),
		);
	}, [onFinish, opacity, scale, translateY]);

	const overlayStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
	}));

	const logoStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: translateY.value }, { scale: scale.value }],
	}));

	return (
		<Animated.View
			pointerEvents="none"
			className="absolute inset-0 items-center justify-center"
			style={[{ backgroundColor, elevation: 24, zIndex: 24 }, overlayStyle]}
		>
			<Animated.View className="items-center justify-center" style={logoStyle}>
				<Image
					source={splashLogo}
					style={{ width: logoWidth, height: logoWidth }}
					contentFit="contain"
					transition={0}
					accessible
					accessibilityLabel="FixIt"
				/>
			</Animated.View>
		</Animated.View>
	);
}
