import { useRef } from "react";
import { View, FlatList } from "react-native";
import { Text } from "@/src/components/ui/text";
import { NEARBY_TECHNICIANS } from "@/src/lib/mock-data/user";
import TechnicianCard, {
  CARD_WIDTH,
  CARD_SPACING,
} from "@/src/components/user/home/TechnicianCard";
import SectionEndArrow from "@/src/components/user/home/SectionEndArrow";

export default function NearYouSection() {
  const flatListRef = useRef<FlatList>(null);

  return (
    <View>
      <View className="mb-2 flex-row items-center px-5">
        <Text className="text-[22px] font-bold text-content" style={{ fontFamily: "GoogleSans_700Bold" }}>Near You</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={NEARBY_TECHNICIANS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TechnicianCard item={item} showDistance />
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
