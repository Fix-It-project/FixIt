import { useRef } from "react";
import { FlatList, useWindowDimensions } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import SectionEndArrow from "@/src/components/user/home/SectionEndArrow";
import SectionHeader from "@/src/components/user/home/SectionHeader";
import TechnicianCard, {
	CARD_SPACING,
	CARD_WIDTH_RATIO,
} from "@/src/components/user/home/TechnicianCard";
import { RECOMMENDED_TECHNICIANS } from "@/src/lib/mock-data/user";

export default function RecommendedTechnicians() {
	const flatListRef = useRef<FlatList>(null);
	const { width: screenWidth } = useWindowDimensions();
	const cardWidth = screenWidth * CARD_WIDTH_RATIO;

	return (
		<Animated.View entering={FadeInDown.delay(200).duration(400)}>
			<SectionHeader title="Recommended" />
			<FlatList
				ref={flatListRef}
				data={RECOMMENDED_TECHNICIANS}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TechnicianCard item={item} cardWidth={cardWidth} showReviewCount />
				)}
				horizontal
				showsHorizontalScrollIndicator={false}
				snapToInterval={cardWidth + CARD_SPACING}
				decelerationRate="fast"
				contentContainerStyle={{
					paddingHorizontal: 20 - CARD_SPACING / 2,
					paddingVertical: 4,
					alignItems: "center",
				}}
				ListFooterComponent={<SectionEndArrow />}
			/>
		</Animated.View>
	);
}
