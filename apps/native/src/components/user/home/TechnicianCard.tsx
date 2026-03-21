import { View, Image } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Star, MapPin } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import type { Technician } from "@/src/lib/mock-data/user";

export const CARD_WIDTH_RATIO = 0.75;
export const CARD_SPACING = 6;

const AVATAR_SIZE = 68;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

interface TechnicianCardProps {
  item: Technician;
  cardWidth: number;
  showReviewCount?: boolean;
  showDistance?: boolean;
}

export default function TechnicianCard({
  item,
  cardWidth,
  showReviewCount = false,
  showDistance = false,
}: TechnicianCardProps) {
  return (
    <View
      style={{
        width: cardWidth,
        marginHorizontal: CARD_SPACING / 2,
      }}
    >
      {/* Cover Image */}
      <Image
        source={item.coverImage}
        className="rounded-[14px]"
        style={{
          width: "100%",
          height: cardWidth * 0.6,
        }}
        resizeMode="cover"
      />

      {/* Avatar overlapping bottom of cover */}
      <View
        style={{
          marginTop: -AVATAR_OVERLAP,
          paddingLeft: 12,
        }}
      >
        <View
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_SIZE / 2,
            backgroundColor: item.avatarColor,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: Colors.surfaceGray,
          }}
        >
          <Text className="text-[18px] font-bold text-white">
            {item.initials}
          </Text>
        </View>
      </View>

      {/* Info below avatar */}
      <View className="mt-1 pl-3 pr-2">
        <Text
          className="text-[16px] font-semibold text-content"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View className="mt-px flex-row items-center gap-1.5">
          <Text className="shrink text-[13px] text-content-muted" numberOfLines={1}>
            {item.category}
          </Text>
          <View className="flex-row items-center gap-0.5">
            <Star size={11} color={Colors.star} fill={Colors.star} strokeWidth={0} />
            <Text className="text-[13px] font-semibold text-content">
              {item.rating}
            </Text>
            {showReviewCount && (
              <Text className="text-[11px] text-content-muted">
                ({item.reviewCount})
              </Text>
            )}
          </View>
          {showDistance && item.distance && (
            <View className="flex-row items-center gap-0.5">
              <MapPin size={11} color={Colors.textMuted} strokeWidth={2} />
              <Text className="text-[11px] text-content-muted">
                {item.distance}
              </Text>
            </View>
          )}
        </View>
        <Text
          className="mt-px text-[13px] text-content-muted"
          numberOfLines={1}
        >
          {item.tagline}
        </Text>
      </View>
    </View>
  );
}
