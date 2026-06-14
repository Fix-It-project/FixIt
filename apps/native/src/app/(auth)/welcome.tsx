import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	DUR_COLLAPSE,
	DUR_REVEAL,
	EASE_OUT_EXPO,
	SPLASH_HOLD_MS,
} from "@/src/constants/animation";
import { space } from "@/src/constants/design-tokens";
import { BrandMark } from "@/src/features/onboarding/components/BrandMark";
import { SplashIntroPanel } from "@/src/features/onboarding/components/SplashIntroPanel";
import { WelcomeContent } from "@/src/features/onboarding/components/WelcomeContent";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

const COLLAPSED_RATIO = 0.58;
// Below this height (vertical split-screen, tiny devices) the absolute splash/surface
// overlaps. Switch to a static, scrollable layout so "Get Started" is always reachable.
const WELCOME_COMPACT_MAX_HEIGHT = 640;
const MOTTO = "Home care, fixed faster.";

export default function WelcomeScreen() {
	const { width: screenW, height: screenH } = useWindowDimensions();
	const reducedMotion = useReducedMotion();
	const compact = screenH < WELCOME_COMPACT_MAX_HEIGHT;
	const useStaticLayout = compact || reducedMotion;

	const reveal = useSharedValue(reducedMotion ? 1 : 0);
	const collapse = useSharedValue(reducedMotion ? 1 : 0);
	// Pinned values for the static-layout BrandMark (full opacity, no collapse scale).
	const staticReveal = useSharedValue(1);
	const staticCollapse = useSharedValue(0);
	const [contentVisible, setContentVisible] = React.useState(reducedMotion);
	const [inputReady, setInputReady] = React.useState(reducedMotion);

	const goToRoleSelection = useDebounce(() =>
		router.push(ROUTES.auth.roleSelection),
	);

	React.useEffect(() => {
		if (useStaticLayout) {
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
	}, [useStaticLayout, reveal, collapse]);

	const collapsedH = screenH * COLLAPSED_RATIO;
	const surfaceH = screenH - collapsedH;

	const surfaceStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: surfaceH * (1 - collapse.value) }],
	}));

	// Compact / reduced-motion: static, scrollable — no absolute panels, no overlap.
	if (useStaticLayout) {
		return (
			<View className="flex-1 bg-surface">
				<StatusBar style="light" />
				<ScrollView
					contentContainerStyle={{ flexGrow: 1 }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<View className="items-center justify-center bg-app-primary px-6 pt-14 pb-8">
						<BrandMark
							width={Math.min(screenW * 0.5, 180)}
							reveal={staticReveal}
							collapse={staticCollapse}
						/>
						<View style={{ height: space[4] }} />
						<Text
							variant="bodyLg"
							className="text-center font-google-sans-medium text-overlay-bright"
						>
							{MOTTO}
						</Text>
					</View>

					<View className="flex-1 bg-surface">
						<WelcomeContent
							contentVisible
							inputReady
							onPressGetStarted={goToRoleSelection}
						/>
					</View>
				</ScrollView>
			</View>
		);
	}

	// Full-height: the animated splash experience.
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
