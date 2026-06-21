import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
	I18nManager,
	ScrollView,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import AcOfferIllustration from "@/src/assets/offers/ac.svg";
import CleaningOfferIllustration from "@/src/assets/offers/cleaning.svg";
import PlumbingOfferIllustration from "@/src/assets/offers/plumbing.svg";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import { DUR_FADE_IN, EASE_OUT_QUART } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation/routes";

const OFFER_CARDS = [
	{
		key: "ac",
		titleKey: "offers.ac.title",
		subtitleKey: "offers.ac.subtitle",
		ctaKey: "offers.ac.cta",
		route: ROUTES.user.categories,
		illustration: AcOfferIllustration,
	},
	{
		key: "cleaning",
		titleKey: "offers.cleaning.title",
		subtitleKey: "offers.cleaning.subtitle",
		ctaKey: "offers.cleaning.cta",
		route: ROUTES.user.categories,
		illustration: CleaningOfferIllustration,
	},
	{
		key: "plumbing",
		titleKey: "offers.plumbing.title",
		subtitleKey: "offers.plumbing.subtitle",
		ctaKey: "offers.plumbing.cta",
		route: ROUTES.user.categories,
		illustration: PlumbingOfferIllustration,
	},
] as const;

export function OfferCard() {
	const t = useThemeColors();
	const { t: tr } = useTranslation("home");
	const { width } = useWindowDimensions();
	const isRTL = I18nManager.isRTL;
	const cardWidth = Math.min(width - 40, 384);
	const cardHeight = 184;
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
				{OFFER_CARDS.map((card) => {
					const Illustration = card.illustration;

					return (
						<PressableScale
							key={card.key}
							pressedScale={0.98}
							onPress={() => router.push(card.route)}
						>
							<LinearGradient
								colors={[t.tint.heroStart, t.tint.heroMid, t.tint.heroEnd]}
								start={{ x: 0.5, y: 0 }}
								end={{ x: 0.5, y: 1 }}
								style={{
									width: cardWidth,
									height: cardHeight,
									borderRadius: 14,
									overflow: "hidden",
									paddingVertical: 22,
									paddingLeft: isRTL ? 118 : 22,
									paddingRight: isRTL ? 22 : 118,
									justifyContent: "center",
								}}
							>
								<View
									pointerEvents="none"
									style={{
										position: "absolute",
										right: isRTL ? undefined : -26,
										left: isRTL ? -26 : undefined,
										bottom: -22,
										width: 170,
										height: 132,
										opacity: 0.42,
										transform: [{ scaleX: isRTL ? -1 : 1 }],
									}}
								>
									<Illustration width="100%" height="100%" />
								</View>

								<View
									style={{
										width: "100%",
										alignItems: isRTL ? "flex-end" : "flex-start",
										gap: 7,
									}}
								>
									<Text
										variant="h3"
										style={{ color: t.tint.onHero, textAlign }}
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
							</LinearGradient>
						</PressableScale>
					);
				})}
			</ScrollView>
		</Animated.View>
	);
}
