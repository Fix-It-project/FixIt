import { useRef } from "react";
import { FlatList, useWindowDimensions, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { NEARBY_TECHNICIANS } from "@/src/lib/mock-data/user";
import { spacing } from "@/src/lib/theme";
import SectionEndArrow from "./SectionFooterArrow";
import TechnicianCard, {
	CARD_SPACING,
	CARD_WIDTH_RATIO,
} from "./TechnicianCard";

export default function NearYouSection() {
	const flatListRef = useRef<FlatList>(null);
	const { width: screenWidth } = useWindowDimensions();
	const cardWidth = screenWidth * CARD_WIDTH_RATIO;

	return (
		<View>
			<View className="mb-stack-sm flex-row items-center px-screen-x">
				<Text variant="h2" className="text-content">
					Near You
				</Text>
			</View>

			<FlatList
				ref={flatListRef}
				data={NEARBY_TECHNICIANS}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<TechnicianCard item={item} cardWidth={cardWidth} showDistance />
				)}
				horizontal
				showsHorizontalScrollIndicator={false}
				snapToInterval={cardWidth + CARD_SPACING}
				decelerationRate="fast"
				contentContainerStyle={{
					paddingHorizontal: spacing.screen.paddingX - CARD_SPACING / 2,
					paddingVertical: spacing.stack.xs,
					alignItems: "center",
				}}
				ListFooterComponent={<SectionEndArrow />}
			/>
		</View>
	);
}
