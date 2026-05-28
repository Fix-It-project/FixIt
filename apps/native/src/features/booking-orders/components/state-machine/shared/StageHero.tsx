import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	DUR_STAGGER,
	STAGGER_GAP,
} from "@/src/constants/animation";
import { radius, space, spacing, useThemeColors } from "@/src/constants/design-tokens";

interface StageHeroProps {
	readonly icon: LucideIcon;
	readonly eyebrow: string;
	readonly title: string;
	readonly subtitle?: string;
	readonly accentColor?: string;
}

export default function StageHero({
	icon: Icon,
	eyebrow,
	title,
	subtitle,
	accentColor,
}: StageHeroProps) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const fadeIn = (i: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(i * STAGGER_GAP).duration(DUR_STAGGER);
	const tint = accentColor ?? themeColors.primary;

	return (
		<View style={{ gap: space[1] }}>
			<Animated.View
				entering={fadeIn(0)}
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: space[2],
				}}
			>
				<View
					style={{
						width: 28,
						height: 28,
						borderRadius: radius.pill,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: `${tint}1A`,
					}}
				>
					<Icon size={spacing.icon.caption} color={tint} strokeWidth={2.6} />
				</View>
				<Text
					variant="caption"
					className="font-google-sans-bold uppercase"
					style={{ color: tint, letterSpacing: 1.2 }}
				>
					{eyebrow}
				</Text>
			</Animated.View>

			<Animated.View entering={fadeIn(1)}>
				<Text
					variant="h3"
					className="font-google-sans-bold text-content"
				>
					{title}
				</Text>
			</Animated.View>

			{subtitle ? (
				<Animated.View entering={fadeIn(2)}>
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
