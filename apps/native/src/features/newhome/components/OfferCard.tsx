import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
	I18nManager,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import { DUR_FADE_IN, EASE_OUT_QUART } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation/routes";

const OFFER_CARDS = [
	{
		key: "cleaning",
		labelKey: "offers.cleaning.label",
		titleKey: "offers.cleaning.title",
		subtitleKey: "offers.cleaning.subtitle",
		ctaKey: "offers.cleaning.cta",
		route: ROUTES.user.categories,
	},
	{
		key: "ac",
		labelKey: "offers.ac.label",
		titleKey: "offers.ac.title",
		subtitleKey: "offers.ac.subtitle",
		ctaKey: "offers.ac.cta",
		route: ROUTES.user.categories,
	},
	{
		key: "plumbing",
		labelKey: "offers.plumbing.label",
		titleKey: "offers.plumbing.title",
		subtitleKey: "offers.plumbing.subtitle",
		ctaKey: "offers.plumbing.cta",
		route: ROUTES.user.categories,
	},
] as const;

export function OfferCard() {
	const t = useThemeColors();
	const { t: tr } = useTranslation("home");
	const { width } = useWindowDimensions();
	const isRTL = I18nManager.isRTL;
	const cardWidth = Math.min(width - 48, 376);
	const textAlign = isRTL ? "right" : "left";

	return (
		<Animated.View
			entering={FadeInUp.delay(160)
				.duration(DUR_FADE_IN)
				.easing(EASE_OUT_QUART)}
		>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				decelerationRate="fast"
				snapToInterval={cardWidth + 12}
				contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
			>
				{OFFER_CARDS.map((card) => (
					<PressableScale
						key={card.key}
						pressedScale={0.98}
						onPress={() => router.push(card.route)}
					>
						<View
							style={{
								width: cardWidth,
								minHeight: 174,
								borderRadius: 14,
								overflow: "hidden",
								backgroundColor: t.tint.heroStart,
								padding: 22,
								justifyContent: "center",
							}}
						>
							<View
								style={{
									width: "100%",
									alignItems: isRTL ? "flex-end" : "flex-start",
									gap: 7,
								}}
							>
								<Text
									variant="caption"
									style={{ color: t.tint.onHero, opacity: 0.84, textAlign }}
									numberOfLines={1}
								>
									{tr(card.labelKey)}
								</Text>
								<Text
									variant="h3"
									style={{ color: t.tint.onHero, textAlign, maxWidth: "86%" }}
									numberOfLines={2}
								>
									{tr(card.titleKey)}
								</Text>
								<Text
									variant="bodySm"
									style={{
										color: t.tint.onHero,
										opacity: 0.88,
										textAlign,
										maxWidth: "92%",
									}}
									numberOfLines={2}
								>
									{tr(card.subtitleKey)}
								</Text>
								<Text
									variant="buttonMd"
									style={{
										color: t.tint.onHero,
										textDecorationLine: "underline",
										textAlign,
										marginTop: 6,
									}}
								>
									{tr(card.ctaKey)}
								</Text>
							</View>
						</View>
					</PressableScale>
				))}
			</ScrollView>
		</Animated.View>
	);
}
