import * as React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	interpolate,
	type SharedValue,
	useAnimatedStyle,
} from "react-native-reanimated";
import WelcomeAsset from "@/src/assets/onboarding/welcomeasset.svg";
import { Text } from "@/src/components/ui/text";
import { space } from "@/src/lib/theme";
import { BrandMark } from "./BrandMark";

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

	const brandMarkWidth = Math.min(screenW * 0.6, 240);
	const welcomeAssetSize = Math.min(screenW * 0.95, 380);

	const initialCenterY = screenH / 2;
	const collapsedH = screenH * collapsedRatio;
	const finalCenterY = insets.top + collapsedH * 0.27;
	const groupTranslateRange = finalCenterY - initialCenterY;

	const groupStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: groupTranslateRange * collapse.value }],
	}));

	const welcomeAssetStyle = useAnimatedStyle(() => ({
		opacity: collapse.value,
		transform: [
			{ translateY: interpolate(collapse.value, [0, 1], [18, 0]) },
			{ scale: interpolate(collapse.value, [0, 1], [0.9, 1]) },
		],
	}));

	const splashMottoStyle = useAnimatedStyle(() => ({
		opacity: reveal.value * (1 - collapse.value),
		transform: [
			{ translateY: interpolate(reveal.value, [0, 1], [16, 0]) },
		],
	}));

	return (
		<View
			style={StyleSheet.absoluteFill}
			pointerEvents="none"
			collapsable={false}
		>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					paddingHorizontal: space[6],
				}}
			>
				<Animated.View style={[{ alignItems: "center" }, groupStyle]}>
					<BrandMark
						width={brandMarkWidth}
						reveal={reveal}
						collapse={collapse}
					/>

					<Animated.View
						style={[
							{
								position: "absolute",
								top: brandMarkWidth * 0.38,
								alignSelf: "center",
								width: welcomeAssetSize,
								height: welcomeAssetSize,
								alignItems: "center",
								justifyContent: "center",
							},
							welcomeAssetStyle,
						]}
					>
						<WelcomeAsset
							width={welcomeAssetSize}
							height={welcomeAssetSize}
						/>
					</Animated.View>

					<View style={{ height: space[4] }} />

					<Animated.View style={splashMottoStyle}>
						<Text
							variant="bodyLg"
							className="text-center font-google-sans-medium text-overlay-bright"
						>
							{motto}
						</Text>
					</Animated.View>
				</Animated.View>
			</View>
		</View>
	);
}
