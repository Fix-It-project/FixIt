import { View, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Star, MapPin, ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { NEARBY_TECHNICIANS, type Technician } from "@/src/lib/mock-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const CARD_SPACING = 12;

function NearbyCard({ item }: { item: Technician }) {
  return (
    <View
      className="overflow-hidden rounded-2xl bg-white p-3.5"
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
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: item.avatarColor }}
        >
          <Text className="text-[14px] font-bold text-white">
            {item.initials}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            className="text-[14px] font-semibold text-content"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text className="mt-0.5 text-[12px] text-content-muted">
            {item.category}
          </Text>
        </View>
      </View>

      {/* Bottom row: rating + distance */}
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Star size={13} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
          <Text className="text-[13px] font-semibold text-content">
            {item.rating}
          </Text>
          <Text className="text-[11px] text-content-muted">
            ({item.reviewCount})
          </Text>
        </View>

        {item.distance && (
          <View className="flex-row items-center gap-1">
            <MapPin size={12} color={Colors.textMuted} strokeWidth={2} />
            <Text className="text-[12px] text-content-muted">
              {item.distance}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function NearYouSection() {
  return (
    <View className="mb-6">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between px-5">
        <Text className="text-lg font-bold text-content">Near You</Text>
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
        data={NEARBY_TECHNICIANS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NearbyCard item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 - CARD_SPACING / 2 }}
      />
    </View>
  );
}
