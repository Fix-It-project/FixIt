import { router } from "expo-router";
import { BadgeCheck, ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import { DUR_FADE_IN, EASE_OUT_QUART } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation/routes";

export function OfferCard() {
	const t = useThemeColors();

	return (
		<Animated.View
			entering={FadeInUp.delay(160)
				.duration(DUR_FADE_IN)
				.easing(EASE_OUT_QUART)}
			style={{ marginHorizontal: 20 }}
		>
			<View
				style={{
					backgroundColor: t.primary,
					borderRadius: 14,
					padding: 16,
					minHeight: 104,
					flexDirection: "row",
					alignItems: "center",
					gap: 14,
				}}
			>
				<View
					style={{
						width: 42,
						height: 42,
						borderRadius: 12,
						backgroundColor: t.overlayWhite,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<BadgeCheck size={22} color={t.tint.onHero} strokeWidth={2} />
				</View>

				<View style={{ flex: 1, minWidth: 0 }}>
					<Text variant="label" style={{ color: t.tint.onHero }}>
						Same-day help nearby
					</Text>
					<Text
						variant="bodySm"
						style={{ color: t.tint.onHero, opacity: 0.86, marginTop: 3 }}
						numberOfLines={2}
					>
						Book verified technicians for your saved address.
					</Text>
				</View>

				<PressableScale
					pressedScale={0.96}
					onPress={() => router.push(ROUTES.user.categories)}
				>
					<View
						style={{
							backgroundColor: t.tint.onHero,
							borderRadius: 10,
							paddingHorizontal: 12,
							paddingVertical: 8,
							flexDirection: "row",
							alignItems: "center",
							gap: 4,
						}}
					>
						<Text variant="buttonMd" style={{ color: t.primary }}>
							Browse
						</Text>
						<ChevronRight size={14} color={t.primary} strokeWidth={2.4} />
					</View>
				</PressableScale>
			</View>
		</Animated.View>
	);
}
