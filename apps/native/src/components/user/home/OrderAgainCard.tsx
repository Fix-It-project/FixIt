import { View, FlatList, Dimensions, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { RotateCcw } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { PREVIOUS_ORDERS, type PreviousOrder } from "@/src/lib/mock-data/user";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.75;
const CARD_SPACING = 8;

function OrderCard({ item }: { item: PreviousOrder }) {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_SPACING / 2,
        borderRadius: 14,
        backgroundColor: Colors.white,
        padding: 14,
      }}
    >
      {/* Top: avatar + info + reorder button */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Avatar */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: item.categoryColor,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
          }}
        >
          <Text className="text-[14px] font-bold text-white">
            {item.initials}
          </Text>
        </View>

        {/* Name + category */}
        <View style={{ flex: 1 }}>
          <Text
            className="text-[14px] font-semibold text-content"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
            numberOfLines={1}
          >
            {item.technicianName}
          </Text>
          <Text className="text-[12px] text-content-muted">
            {item.category}
          </Text>
        </View>

        {/* Pill-shaped transparent outline button */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: "transparent",
            borderWidth: 1.5,
            borderColor: Colors.borderLight,
            borderRadius: 100, // Pill shape
            paddingHorizontal: 18, // Generous padding for pill proportions
            paddingVertical: 8, // A bit of height but proportional
          }}
        >
          <RotateCcw size={14} color={Colors.darkText} strokeWidth={2.5} style={{ marginTop: -1 }} />
          <Text
            className="text-[13px] font-bold text-content"
            style={{ fontFamily: "GoogleSans_700Bold", lineHeight: 16 }}
          >
            Reorder
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom row: date + price */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: Colors.surfaceLight,
        }}
      >
        <Text className="text-[12px] text-content-muted">{item.date}</Text>
        <Text
          className="text-[13px] font-semibold text-content"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
        >
          {item.price}
        </Text>
      </View>
    </View>
  );
}

export default function PreviousOrdersSection() {
  if (PREVIOUS_ORDERS.length === 0) return null;

  return (
    <View>
      {/* Header */}
      <View className="mb-2 flex-row items-center px-5">
        <Text
          className="text-[22px] font-bold text-content"
          style={{ fontFamily: "GoogleSans_700Bold" }}
        >
          Previous Orders
        </Text>
      </View>

      {/* Horizontal list – max 3, no end arrow */}
      <FlatList
        data={PREVIOUS_ORDERS.slice(0, 3)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderCard item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: 20 - CARD_SPACING / 2,
          paddingVertical: 4,
        }}
      />
    </View>
  );
}
