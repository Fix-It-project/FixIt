import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import {
	DUR_COLLAPSE,
	DUR_REVEAL,
	EASE_OUT_EXPO,
	SPLASH_HOLD_MS,
} from "@/src/features/onboarding/animation/constants";
import { SplashIntroPanel } from "@/src/features/onboarding/components/SplashIntroPanel";
import { WelcomeContent } from "@/src/features/onboarding/components/WelcomeContent";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

const COLLAPSED_RATIO = 0.58;
const MOTTO = "Home care, fixed faster.";

export default function WelcomeScreen() {
	const { height: screenH } = useWindowDimensions();
	const reducedMotion = useReducedMotion();

	const reveal = useSharedValue(reducedMotion ? 1 : 0);
	const collapse = useSharedValue(reducedMotion ? 1 : 0);
	const [contentVisible, setContentVisible] = React.useState(reducedMotion);
	const [inputReady, setInputReady] = React.useState(reducedMotion);

	React.useEffect(() => {
		if (reducedMotion) {
			setContentVisible(true);
			setInputReady(true);
			return;
		}

		reveal.value = withTiming(1, {
			duration: DUR_REVEAL,
			easing: EASE_OUT_EXPO,
		});

		const collapseStartMs = DUR_REVEAL + SPLASH_HOLD_MS;
		const contentTimer = setTimeout(
			() => setContentVisible(true),
			collapseStartMs,
		);

		collapse.value = withDelay(
			collapseStartMs,
			withTiming(
				1,
				{ duration: DUR_COLLAPSE, easing: EASE_OUT_EXPO },
				(finished) => {
					if (finished) runOnJS(setInputReady)(true);
				},
			),
		);

		return () => clearTimeout(contentTimer);
	}, [reducedMotion, reveal, collapse]);

	const collapsedH = screenH * COLLAPSED_RATIO;
	const surfaceH = screenH - collapsedH;

	const surfaceStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: surfaceH * (1 - collapse.value) }],
	}));

	const goToRoleSelection = useDebounce(() =>
		router.push(ROUTES.auth.roleSelection),
	);

	return (
		<View className="flex-1 bg-app-primary">
			<StatusBar style="light" />

			<SplashIntroPanel
				motto={MOTTO}
				collapsedRatio={COLLAPSED_RATIO}
				reveal={reveal}
				collapse={collapse}
			/>

			<Animated.View
				style={[
					{
						position: "absolute",
						left: 0,
						right: 0,
						top: collapsedH,
						bottom: 0,
					},
					surfaceStyle,
				]}
				pointerEvents={inputReady ? "auto" : "none"}
			>
				<View className="flex-1 bg-surface">
					<WelcomeContent
						contentVisible={contentVisible}
						inputReady={inputReady}
						onPressGetStarted={goToRoleSelection}
					/>
				</View>
			</Animated.View>
		</View>
	);
}
