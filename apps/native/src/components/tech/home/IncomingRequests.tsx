import { View, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
  Snowflake,
  Droplets,
  Zap,
  MapPin,
  type LucideIcon,
} from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { INCOMING_REQUESTS } from "@/src/lib/mock-data/tech";
import type { IncomingRequest } from "@/src/lib/mock-data/tech";
import Animated, { FadeInRight } from "react-native-reanimated";

const CARD_WIDTH_RATIO = 0.72;

/** Map icon name strings from mock data to actual lucide components */
const ICON_MAP: Record<string, LucideIcon> = {
  Snowflake,
  Droplets,
  Zap,
};

function RequestCard({
  item,
  index,
  cardWidth,
}: {
  item: IncomingRequest;
  index: number;
  cardWidth: number;
}) {
  const IconComponent = ICON_MAP[item.icon] || Zap;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={{
        width: cardWidth,
        marginRight: 12,
      }}
    >
      <View
        className="rounded-2xl bg-white p-4"
        style={{
          borderWidth: item.isHighlighted ? 2 : 1,
          borderColor: item.isHighlighted ? Colors.brand : Colors.borderLight,
          shadowColor: item.isHighlighted ? Colors.brand : Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: item.isHighlighted ? 0.15 : 0.06,
          shadowRadius: 8,
          elevation: item.isHighlighted ? 4 : 2,
        }}
      >
        {/* Top row */}
        <View className="mb-3 flex-row items-start justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${item.iconColor}15` }}
            >
              <IconComponent
                size={20}
                color={item.iconColor}
                strokeWidth={1.8}
              />
            </View>
            <View className="shrink">
              <Text
                className="text-sm font-bold text-content"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
                numberOfLines={1}
              >
                {item.serviceType}
              </Text>
              <Text className="text-[10px] uppercase text-content-muted" numberOfLines={1}>
                {item.distance}
              </Text>
            </View>
          </View>
          <Text
            className="font-bold"
            style={{
              color: item.isHighlighted ? Colors.brand : Colors.textPrimary,
              fontFamily: "GoogleSans_700Bold",
            }}
          >
            {item.price}
          </Text>
        </View>

        {/* Location */}
        <View className="mb-4 flex-row items-center gap-1.5">
          <MapPin size={12} color={Colors.textMuted} strokeWidth={2} />
          <Text
            className="flex-1 text-xs text-content-muted"
            numberOfLines={1}
          >
            {item.location}
          </Text>
        </View>

        {/* Action buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 items-center rounded-xl py-2.5"
            style={{ backgroundColor: Colors.brand }}
            activeOpacity={0.85}
          >
            <Text
              className="text-xs font-bold text-white"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              Accept
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 items-center rounded-xl border py-2.5"
            style={{ borderColor: Colors.borderLight }}
            activeOpacity={0.7}
          >
            <Text
              className="text-xs font-bold text-content"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              Decline
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function IncomingRequests() {
  const { width } = useWindowDimensions();
  const cardWidth = width * CARD_WIDTH_RATIO;

  return (
    <View className="mt-6">
      {/* Section header */}
      <View className="mb-3 px-4">
        <Text className="text-xs font-bold uppercase tracking-widest text-content-muted">
          Incoming Requests
        </Text>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {INCOMING_REQUESTS.map((item, index) => (
          <RequestCard key={item.id} item={item} index={index} cardWidth={cardWidth} />
        ))}
      </ScrollView>
    </View>
  );
}
