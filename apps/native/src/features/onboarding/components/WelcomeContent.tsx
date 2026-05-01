import { ArrowRight } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import { Colors, space } from "@/src/lib/theme";
import { DUR_STAGGER, STAGGER_GAP } from "../animation/constants";
import { PressableScale } from "./PressableScale";

interface WelcomeContentProps {
	contentVisible: boolean;
	inputReady: boolean;
	onPressGetStarted: () => void;
}

export function WelcomeContent({
	contentVisible,
	inputReady,
	onPressGetStarted,
}: WelcomeContentProps) {
	const insets = useSafeAreaInsets();
	const reducedMotion = useReducedMotion();

	const enterDelay = (index: number): number =>
		reducedMotion ? 0 : index * STAGGER_GAP;

	if (!contentVisible) {
		return null;
	}

	return (
		<View
			style={{
				flex: 1,
				paddingHorizontal: space[6],
				paddingBottom: insets.bottom + space[4],
				justifyContent: "flex-end",
			}}
		>
			<View
				style={{
					alignSelf: "center",
					width: "100%",
					maxWidth: 420,
					gap: space[5],
				}}
			>
				<Animated.View
					entering={
						reducedMotion
							? undefined
							: FadeInDown.delay(enterDelay(0)).duration(DUR_STAGGER)
					}
				>
					<Text variant="h1" className="font-google-sans-bold text-content">
						Trusted help,{"\n"}one tap away.
					</Text>
				</Animated.View>

				<Animated.View
					entering={
						reducedMotion
							? undefined
							: FadeInDown.delay(enterDelay(1)).duration(DUR_STAGGER)
					}
				>
					<Text variant="body" className="text-content-secondary">
						Find a verified technician for repairs and home care, when you
						actually need them.
					</Text>
				</Animated.View>

				<Animated.View
					entering={
						reducedMotion
							? undefined
							: FadeInDown.delay(enterDelay(2)).duration(DUR_STAGGER)
					}
					style={{ marginTop: space[2] }}
				>
					<PressableScale
						onPress={onPressGetStarted}
						disabled={!inputReady}
						accessibilityRole="button"
						accessibilityLabel="Get started"
						accessibilityState={{ disabled: !inputReady }}
					>
						<View className="w-full flex-row items-center justify-between gap-stack-sm rounded-button bg-app-primary px-button-x py-control-cta-y">
							<View style={{ width: space[5] }} />
							<Text
								variant="buttonLg"
								className="font-google-sans-bold text-surface-on-primary"
							>
								Get Started
							</Text>
							<ArrowRight size={20} color={Colors.surfaceBase} />
						</View>
					</PressableScale>
				</Animated.View>

				<Animated.View
					entering={
						reducedMotion
							? undefined
							: FadeInDown.delay(enterDelay(3)).duration(DUR_STAGGER)
					}
				>
					<Text variant="caption" className="text-center text-content-muted">
						By continuing you agree to our Terms of Service and Privacy Policy.
					</Text>
				</Animated.View>
			</View>
		</View>
	);
}
