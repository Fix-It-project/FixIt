import { useRef } from "react";
import {
  View,
  FlatList,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { RECOMMENDED_TECHNICIANS } from "@/src/lib/mock-data/user";
import TechnicianCard, {
  CARD_WIDTH,
  CARD_SPACING,
} from "@/src/components/user/home/TechnicianCard";
import SectionEndArrow from "@/src/components/user/home/SectionEndArrow";

export default function RecommendedTechnicians() {
  const flatListRef = useRef<FlatList>(null);

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
          <TechnicianCard item={item} showReviewCount />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
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
