import { router } from "expo-router";
import LottieView, { type LottieViewProps } from "lottie-react-native";
import { ArrowRight } from "lucide-react-native";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { DUR_SLIDE_UP, ENTRANCE_STAGGER } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation";

interface OnboardingStep {
	readonly key: string;
	readonly lottie: unknown;
	readonly title: string;
	readonly body: string;
}

const STEPS: readonly OnboardingStep[] = [
	{
		key: "availability",
		lottie: require("@/src/assets/lottie/schedule-availability.json"),
		title: "Set your weekly availability",
		body: "Choose the days you take jobs. Customers can only book you on the days you turn on.",
	},
	{
		key: "slots",
		lottie: require("@/src/assets/lottie/schedule-slots.json"),
		title: "Pick your visit times",
		body: "Offer up to five time slots a day, so every booking lands at an hour that works for you.",
	},
	{
		key: "ready",
		lottie: require("@/src/assets/lottie/schedule-ready.json"),
		title: "Stay in control",
		body: "Block a single day whenever you're off, and watch new bookings fill your calendar.",
	},
];

/**
 * First-run schedule onboarding — a Lottie multi-step intro shown only while the
 * technician has never completed setup. The final step routes to the full setup
 * screen (no freezing modal, unlike the old flow).
 */
export function ScheduleOnboarding() {
	const themeColors = useThemeColors();
	const { width } = useWindowDimensions();
	const [index, setIndex] = useState(0);
	const step = STEPS[index];
	const isLast = index === STEPS.length - 1;

	// Scale the art to the device: ~60% of width, capped so it never dominates a
	// tablet nor overflows a small phone. The Lottie keeps its 224/256 ratio
	// inside the circle, and the copy width tracks the screen instead of a fixed cap.
	const artSize = Math.min(256, Math.round(width * 0.6));
	const lottieSize = Math.round(artSize * 0.875);
	const copyMaxWidth = Math.min(320, Math.round(width * 0.82));

	const goSetup = () => router.push(ROUTES.technician.scheduleSetup);
	const onPrimary = () => (isLast ? goSetup() : setIndex((i) => i + 1));

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />

			<View className="flex-1">
				<View className="flex-row justify-end px-screen-x pt-stack-md">
					<PressableScale
						pressedScale={0.96}
						onPress={goSetup}
						className="px-stack-md py-stack-xs"
						accessibilityLabel="Skip intro and set up schedule"
					>
						<Text
							variant="buttonMd"
							className="font-semibold text-content-muted"
						>
							Skip
						</Text>
					</PressableScale>
				</View>

				<View className="flex-1 items-center justify-center px-screen-x">
					<Animated.View
						key={`art-${step.key}`}
						entering={FadeIn.duration(DUR_SLIDE_UP)}
						exiting={FadeOut.duration(160)}
						className="mb-stack-xl items-center justify-center rounded-full bg-app-primary/5"
						style={{ width: artSize, height: artSize }}
					>
						<LottieView
							source={step.lottie as LottieViewProps["source"]}
							autoPlay
							loop
							style={{ width: lottieSize, height: lottieSize }}
						/>
					</Animated.View>

					<Animated.View
						key={`title-${step.key}`}
						entering={FadeInDown.duration(DUR_SLIDE_UP)}
					>
						<Text variant="h2" className="text-center text-content">
							{step.title}
						</Text>
					</Animated.View>

					<Animated.View
						key={`body-${step.key}`}
						entering={FadeInDown.duration(DUR_SLIDE_UP).delay(ENTRANCE_STAGGER)}
						className="mt-stack-md"
						style={{ maxWidth: copyMaxWidth }}
					>
						<Text variant="body" className="text-center text-content-secondary">
							{step.body}
						</Text>
					</Animated.View>
				</View>

				<View className="gap-stack-lg px-screen-x pb-stack-2xl">
					<View className="flex-row items-center justify-center gap-stack-xs">
						{STEPS.map((s, i) => (
							<View
								key={s.key}
								className="h-2 rounded-pill"
								style={{
									width: i === index ? 24 : 8,
									backgroundColor:
										i === index
											? themeColors.primary
											: themeColors.borderDefault,
								}}
							/>
						))}
					</View>

					<Button
						size="lg"
						fullWidth
						iconRight={ArrowRight}
						onPress={onPrimary}
					>
						{isLast ? "Set up schedule" : "Next"}
					</Button>
				</View>
			</View>
		</View>
	);
}
