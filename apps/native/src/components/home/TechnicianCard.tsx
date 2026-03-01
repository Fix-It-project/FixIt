import { View, Image, Dimensions } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Star, MapPin } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import type { Technician } from "@/src/lib/mock-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const CARD_WIDTH = SCREEN_WIDTH * 0.75;
export const CARD_SPACING = 6;

const COVER_HEIGHT = 150;
const AVATAR_SIZE = 56;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

interface TechnicianCardProps {
  item: Technician;
  showReviewCount?: boolean;
  showDistance?: boolean;
}

export default function TechnicianCard({
  item,
  showReviewCount = false,
  showDistance = false,
}: TechnicianCardProps) {
  return (
    <View
      style={{
        width: CARD_WIDTH,
        marginHorizontal: CARD_SPACING / 2,
      }}
    >
      {/* Cover Image */}
      <Image
        source={item.coverImage}
        style={{ width: "100%", height: COVER_HEIGHT, borderRadius: 14 }}
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
          <Text className="text-[16px] font-bold text-white">
            {item.initials}
          </Text>
        </View>
      </View>

      {/* Info below avatar */}
      <View style={{ paddingLeft: 12, paddingRight: 8, marginTop: 6 }}>
        <Text
          className="text-[15px] font-semibold text-content"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <Text className="text-[12px] text-content-muted">
            {item.category}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
            }}
          >
            <Star size={11} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
            <Text className="text-[12px] font-semibold text-content">
              {item.rating}
            </Text>
            {showReviewCount && (
              <Text className="text-[11px] text-content-muted">
                ({item.reviewCount})
              </Text>
            )}
          </View>
          {showDistance && item.distance && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              <MapPin size={11} color={Colors.textMuted} strokeWidth={2} />
              <Text className="text-[11px] text-content-muted">
                {item.distance}
              </Text>
            </View>
          )}
        </View>
        <Text
          className="mt-1 text-[12px] text-content-muted"
          numberOfLines={1}
        >
          {item.tagline}
        </Text>
      </View>
    </View>
  );
}
