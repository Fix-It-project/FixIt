import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WelcomeAsset from "@/src/assets/onboarding/welcomeasset.svg";
import { Text } from "@/src/components/ui/text";
import { space } from "@/src/constants/design-tokens";
import { BrandMark } from "./BrandMark";
import { brandMarkWidthFor, illustrationSizeFor } from "./welcome-layout";

interface SplashIntroPanelProps {
	motto: string;
	collapsedRatio: number;
	reveal: SharedValue<number>;
	collapse: SharedValue<number>;
}

export function SplashIntroPanel({
	motto,
	collapsedRatio,
	reveal,
	collapse,
}: SplashIntroPanelProps) {
	const { width: screenW, height: screenH } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	// The blue panel is exactly the slice the white surface leaves uncovered when
	// collapsed. Lay it out as a flex column so the brand block self-centers across
	// every device height instead of relying on hand-tuned absolute offsets.
	const panelHeight = screenH * collapsedRatio;
	// Push the wordmark down so it clears the status bar / notch and reads as a
	// deliberate logo rather than a clipped sliver. Folded into topPad (not a
	// marginTop) so illustrationSizeFor() reserves the right room below.
	const topPad = insets.top + space[12];
	const brandMarkWidth = brandMarkWidthFor(screenW);
	const illustrationSize = illustrationSizeFor(screenW, panelHeight, topPad);

	const illustrationStyle = useAnimatedStyle(() => ({
		opacity: collapse.value,
		transform: [
			{ translateY: interpolate(collapse.value, [0, 1], [18, 0]) },
			{ scale: interpolate(collapse.value, [0, 1], [0.92, 1]) },
		],
	}));

	const mottoStyle = useAnimatedStyle(() => ({
		opacity: reveal.value * (1 - collapse.value),
		transform: [{ translateY: interpolate(reveal.value, [0, 1], [16, 0]) }],
	}));

	return (
		<View
			style={StyleSheet.absoluteFill}
			pointerEvents="none"
			collapsable={false}
		>
			<View
				style={{
					height: panelHeight,
					paddingTop: topPad,
					overflow: "hidden",
				}}
			>
				{/* Wordmark — small, sits like a logo above the hero. */}
				<View style={{ alignItems: "center" }}>
					<BrandMark
						width={brandMarkWidth}
						reveal={reveal}
						collapse={collapse}
					/>
				</View>

				{/* Illustration — the hero, large and centered in the remaining blue. */}
				<Animated.View
					style={[
						{
							flex: 1,
							alignItems: "center",
							justifyContent: "center",
							paddingBottom: space[10],
						},
						illustrationStyle,
					]}
				>
					<WelcomeAsset width={illustrationSize} height={illustrationSize} />
				</Animated.View>

				{/* Motto — shown during the reveal, fades out on collapse. */}
				<Animated.View
					style={[
						{
							position: "absolute",
							bottom: space[8],
							left: 0,
							right: 0,
							alignItems: "center",
						},
						mottoStyle,
					]}
				>
					<Text
						variant="bodyLg"
						className="text-center font-google-sans-medium text-overlay-bright"
					>
						{motto}
					</Text>
				</Animated.View>
			</View>
		</View>
	);
}
