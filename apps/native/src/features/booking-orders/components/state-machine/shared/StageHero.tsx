import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { DUR_STAGGER, STAGGER_GAP } from "@/src/constants/animation";
import { space } from "@/src/constants/design-tokens";

// `icon` + `eyebrow` are accepted for call-site back-compat but intentionally
// not rendered: the old uppercase tracked eyebrow + tinted icon chip is gone.
// Phase identity now reads off the stepper alone; the hero shows one plain
// title (+ optional subtitle).
interface StageHeroProps {
	readonly icon?: LucideIcon;
	readonly eyebrow?: string;
	readonly title: string;
	readonly subtitle?: string;
	readonly accentColor?: string;
}

export default function StageHero({ title, subtitle }: StageHeroProps) {
	const reducedMotion = useReducedMotion();
	const fadeIn = (i: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(i * STAGGER_GAP).duration(DUR_STAGGER);

	return (
		<View style={{ gap: space[1] }}>
			<Animated.View entering={fadeIn(0)}>
				<Text variant="h3" className="font-google-sans-bold text-content">
					{title}
				</Text>
			</Animated.View>

			{subtitle ? (
				<Animated.View entering={fadeIn(1)}>
					<Text
						variant="bodySm"
						className="text-content-secondary"
						style={{ marginTop: space[1] }}
					>
						{subtitle}
					</Text>
				</Animated.View>
			) : null}
		</View>
	);
}
