import { useRef, useState, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  type ViewToken,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { Star, ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { RECOMMENDED_TECHNICIANS, type Technician } from "@/src/lib/mock-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.38;
const CARD_SPACING = 12;

function TechnicianCard({ item }: { item: Technician }) {
  return (
    <View
      className="items-center overflow-hidden rounded-2xl bg-white pb-3 pt-4"
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_SPACING / 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      {/* Avatar */}
      <View
        className="mb-2.5 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: item.avatarColor }}
      >
        <Text className="text-lg font-bold text-white">{item.initials}</Text>
      </View>

      {/* Name */}
      <Text
        className="mb-0.5 text-[14px] font-semibold text-content"
        numberOfLines={1}
      >
        {item.name}
      </Text>

      {/* Category */}
      <Text className="mb-2 text-[12px] text-content-muted">{item.category}</Text>

      {/* Rating */}
      <View className="flex-row items-center gap-1">
        <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
        <Text className="text-[13px] font-semibold text-content">
          {item.rating}
        </Text>
        <Text className="text-[11px] text-content-muted">
          ({item.reviewCount})
        </Text>
      </View>
    </View>
  );
}

export default function RecommendedTechnicians() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  return (
    <View className="mb-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between px-5">
        <Text className="text-lg font-bold text-content">Recommended</Text>
        <TouchableOpacity
          className="flex-row items-center gap-0.5"
          activeOpacity={0.7}
        >
          <Text
            className="text-[13px] font-semibold"
            style={{ color: Colors.brand }}
          >
            See All
          </Text>
          <ChevronRight size={14} color={Colors.brand} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Horizontal list */}
      <FlatList
        ref={flatListRef}
        data={RECOMMENDED_TECHNICIANS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TechnicianCard item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 - CARD_SPACING / 2 }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination dots */}
      <View className="mt-3 flex-row items-center justify-center gap-1.5">
        {RECOMMENDED_TECHNICIANS.map((_, i) => (
          <View
            key={`dot-${i}`}
            className="rounded-full"
            style={{
              width: i === activeIndex ? 20 : 6,
              height: 6,
              backgroundColor:
                i === activeIndex ? Colors.brand : Colors.borderLight,
            }}
          />
        ))}
      </View>
    </View>
  );
}
