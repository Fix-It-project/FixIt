import { useRef, useState, useCallback } from "react";
import {
  View,
  FlatList,
  Animated,
  TouchableOpacity,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { RECOMMENDED_TECHNICIANS } from "@/src/lib/mock-data";
import TechnicianCard, {
  CARD_WIDTH,
  CARD_SPACING,
} from "@/src/components/home/TechnicianCard";

const TOTAL_ITEMS = RECOMMENDED_TECHNICIANS.length;

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
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animated widths for pagination dots
  const dotWidths = useRef(
    RECOMMENDED_TECHNICIANS.map((_, i) =>
      new Animated.Value(i === 0 ? 20 : 6)
    )
  ).current;

  const animateDots = useCallback(
    (newIndex: number) => {
      dotWidths.forEach((dot, i) => {
        Animated.timing(dot, {
          toValue: i === newIndex ? 20 : 6,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    },
    [dotWidths]
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_SPACING));
      const clampedIndex = Math.min(Math.max(index, 0), TOTAL_ITEMS - 1);
      if (clampedIndex !== activeIndex) {
        setActiveIndex(clampedIndex);
        animateDots(clampedIndex);
      }
    },
    [activeIndex, animateDots]
  );

  return (
    <View className="mb-2">
      {/* Header */}
      <View className="mb-2 flex-row items-center px-5">
        <Text className="text-[22px] font-bold text-content" style={{ fontFamily: "GoogleSans_700Bold" }}>Recommended</Text>
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ListFooterComponent={<EndArrow />}
      />

      {/* Animated pagination dots */}
      <View className="mt-2.5 flex-row items-center justify-center gap-1.5">
        {RECOMMENDED_TECHNICIANS.map((_, i) => (
          <Animated.View
            key={`dot-${i}`}
            style={{
              width: dotWidths[i],
              height: 6,
              borderRadius: 3,
              backgroundColor:
                i === activeIndex ? Colors.brand : Colors.borderLight,
            }}
          />
        ))}
      </View>
    </View>
  );
}
