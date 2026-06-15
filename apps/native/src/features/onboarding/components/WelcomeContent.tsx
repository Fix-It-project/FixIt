import { ArrowRight } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { DUR_STAGGER, STAGGER_GAP } from "@/src/constants/animation";
import { space } from "@/src/constants/design-tokens";

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
	const bottomInset = Math.min(insets.bottom, space[8]);

	const enterDelay = (index: number): number =>
		reducedMotion ? 0 : index * STAGGER_GAP;

	if (!contentVisible) {
		return [];
	}

	return (
		<View
			style={{
				flex: 1,
				paddingHorizontal: space[6],
				paddingTop: space[8],
				paddingBottom: bottomInset + space[2],
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
					<Button
						onPress={onPressGetStarted}
						disabled={!inputReady}
						accessibilityLabel="Get started"
						testID="welcome-get-started"
						fullWidth
						size="lg"
						iconRight={ArrowRight}
					>
						Get Started
					</Button>
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
