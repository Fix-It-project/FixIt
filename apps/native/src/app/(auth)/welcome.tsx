import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WelcomeAsset from "@/src/assets/onboarding/welcomeasset.svg";
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
import { brandMarkWidthFor } from "@/src/features/onboarding/components/welcome-layout";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import {
	selectIsLocationSatisfied,
	useLocationStore,
} from "@/src/stores/location-store";

const COLLAPSED_RATIO = 0.58;
// Below this height (vertical split-screen, tiny devices) the absolute splash/surface
// overlaps. Switch to a static, scrollable layout so "Get Started" is always reachable.
const WELCOME_COMPACT_MAX_HEIGHT = 640;

export default function WelcomeScreen() {
	const { t } = useTranslation("auth");
	const { width: screenW, height: screenH } = useWindowDimensions();
	const reducedMotion = useReducedMotion();
	const insets = useSafeAreaInsets();
	const compact = screenH < WELCOME_COMPACT_MAX_HEIGHT;
	const useStaticLayout = compact || reducedMotion;

	const reveal = useSharedValue(reducedMotion ? 1 : 0);
	const collapse = useSharedValue(reducedMotion ? 1 : 0);
	// Pinned values for the static-layout BrandMark (full opacity, no collapse scale).
	const staticReveal = useSharedValue(1);
	const staticCollapse = useSharedValue(0);
	const [contentVisible, setContentVisible] = React.useState(reducedMotion);
	const [inputReady, setInputReady] = React.useState(reducedMotion);

	const gateArmed = useLocationStore((state) => state.gateArmed);
	const isLocationSatisfied = useLocationStore(selectIsLocationSatisfied);

	// Get Started: go straight to role selection when location is already satisfied;
	// otherwise arm the gate so it appears OVER welcome (never under role-selection,
	// which would leave its entrance animations stuck hidden). Reads fresh state to
	// avoid a stale closure from the debounced callback.
	const goToRoleSelection = useDebounce(() => {
		if (selectIsLocationSatisfied(useLocationStore.getState())) {
			router.push(ROUTES.auth.roleSelection);
			return;
		}
		useLocationStore.getState().armGate();
	});

	// Once the gate is satisfied after arming, proceed to role selection.
	React.useEffect(() => {
		if (gateArmed && isLocationSatisfied) {
			useLocationStore.getState().disarmGate();
			router.push(ROUTES.auth.roleSelection);
		}
	}, [gateArmed, isLocationSatisfied]);

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
	const staticBrandWidth = brandMarkWidthFor(screenW);
	// Static layout scrolls, so vertical room is scarce (split-screen / small
	// devices). Keep the hero generous but bounded by height so the CTA stays reachable.
	const staticIllustrationSize = Math.min(screenW * 0.7, screenH * 0.4, 360);

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
					<View
						className="items-center justify-center bg-app-primary px-6"
						style={{
							paddingTop: insets.top + space[12],
							paddingBottom: space[10],
							overflow: "hidden",
							borderBottomLeftRadius: 24,
							borderBottomRightRadius: 24,
						}}
					>
						<BrandMark
							width={staticBrandWidth}
							reveal={staticReveal}
							collapse={staticCollapse}
						/>
						<View style={{ height: space[10] }} />
						<WelcomeAsset
							width={staticIllustrationSize}
							height={staticIllustrationSize}
						/>
						<View style={{ height: space[8] }} />
						<Text
							variant="bodyLg"
							className="text-center font-google-sans-medium text-overlay-bright"
						>
							{t("welcome.motto")}
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
				motto={t("welcome.motto")}
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
