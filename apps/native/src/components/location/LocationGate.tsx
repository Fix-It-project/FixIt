import { setStatusBarStyle } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions, View } from "react-native";
import Animated, {
	FadeIn,
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LocationIllustration from "@/src/assets/onboarding/location.svg";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { space, useThemeTokens } from "@/src/constants/design-tokens";
import { useLocationGate } from "@/src/hooks/useLocationGate";

// location.svg is a portrait artboard (1024 x 1536); height follows width.
const ILLUSTRATION_RATIO = 1536 / 1024;

/**
 * Mandatory, non-dismissable location gate. Rendered as a full-screen overlay
 * above the navigator (see app/_layout.tsx) whenever location isn't satisfied,
 * so the user cannot reach any screen without enabling location. There is no
 * close affordance by design.
 */
export function LocationGate() {
	const { t } = useTranslation("location");
	const insets = useSafeAreaInsets();
	const reducedMotion = useReducedMotion();
	const tokens = useThemeTokens();
	const { width, height } = useWindowDimensions();
	const { status, isLoading, onPressCta } = useLocationGate();

	// The gate sits on the surface; keep status-bar icons legible even if it
	// appears over a screen that had set light (blue-chrome) icons.
	useEffect(() => {
		setStatusBarStyle(tokens.statusBarStyle);
	}, [tokens.statusBarStyle]);

	const illustrationW = Math.min(width * 0.6, height * 0.34, 280);
	const fadeDown = (delay: number) =>
		reducedMotion ? undefined : FadeInDown.delay(delay).duration(440);

	const ctaLabel =
		status === "request"
			? t("gate.cta.request")
			: status === "requestBackground"
				? t("gate.cta.requestBackground")
				: status === "openSettings"
					? t("gate.cta.openSettings")
					: t("gate.cta.enableServices");

	const hint =
		status === "openSettings"
			? t("gate.deniedHint")
			: status === "servicesOff"
				? t("gate.servicesHint")
				: status === "requestBackground"
					? t("gate.backgroundHint")
					: null;

	// The background ("Always") step gets its own title/body so technicians
	// understand why a second, stronger permission is being requested.
	const isBackgroundStep = status === "requestBackground";
	const title = isBackgroundStep ? t("gate.backgroundTitle") : t("gate.title");
	const body = isBackgroundStep ? t("gate.backgroundBody") : t("gate.body");

	return (
		<View
			className="absolute inset-0 bg-surface"
			style={{
				paddingTop: insets.top + space[6],
				paddingBottom: insets.bottom + space[6],
				paddingHorizontal: space[6],
			}}
		>
			<View className="flex-1 items-center justify-center">
				<Animated.View entering={fadeDown(0)} className="items-center">
					<LocationIllustration
						width={illustrationW}
						height={illustrationW * ILLUSTRATION_RATIO}
					/>
				</Animated.View>

				<Animated.View
					entering={fadeDown(90)}
					className="mt-stack-xl items-center"
				>
					<Text variant="h2" className="text-center text-content">
						{title}
					</Text>
					<Text
						variant="body"
						className="mt-stack-sm text-center text-content-secondary"
					>
						{body}
					</Text>
					{hint ? (
						<Text
							variant="bodySm"
							className="mt-stack-md text-center text-content-secondary"
						>
							{hint}
						</Text>
					) : null}
				</Animated.View>
			</View>

			<Animated.View
				entering={reducedMotion ? undefined : FadeIn.delay(220).duration(440)}
			>
				<Button
					variant="primary"
					size="lg"
					fullWidth
					loading={isLoading}
					onPress={() => {
						void onPressCta();
					}}
					accessibilityLabel={ctaLabel}
				>
					<Text variant="buttonLg" className="text-surface-on-primary">
						{ctaLabel}
					</Text>
				</Button>
			</Animated.View>
		</View>
	);
}
