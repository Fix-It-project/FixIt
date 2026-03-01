import { useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { RECOMMENDED_TECHNICIANS } from "@/src/lib/mock-data";
import TechnicianCard, {
  CARD_WIDTH,
  CARD_SPACING,
} from "@/src/components/home/TechnicianCard";

function EndArrow({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: 56,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 4,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: Colors.brand,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ChevronRight size={26} color="#fff" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

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
        ListFooterComponent={<EndArrow />}
      />
    </View>
  );
}
