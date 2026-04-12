import { useRef } from "react";
import {
  View,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { RECOMMENDED_TECHNICIANS } from "@/src/lib/mock-data/user";
import TechnicianCard, {
  CARD_WIDTH_RATIO,
  CARD_SPACING,
} from "./TechnicianCard";
import SectionEndArrow from "./SectionFooterArrow";

export default function RecommendedTechnicians() {
  const flatListRef = useRef<FlatList>(null);
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * CARD_WIDTH_RATIO;

  return (
    <View>
      {/* Header */}
      <View className="mb-2 flex-row items-center px-5">
        <Text
          className="text-[22px] font-bold text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          Recommended
        </Text>
      </View>

      {/* Horizontal list */}
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
    </View>
  );
}
