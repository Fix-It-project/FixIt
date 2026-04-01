import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, ClipboardList, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { CATEGORIES } from "@/src/lib/categories";
import { formatDate, getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import type { TechnicianOrder } from "@/src/services/tech-calendar/schemas/response.schema";

interface BookingCardProps {
  readonly booking: TechnicianOrder;
  readonly index: number;
}

export default function BookingCard({ booking, index }: BookingCardProps) {
  const category = CATEGORIES.find((c) => c.id === booking.category_id);
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.brand;
  const initials = getInitials(booking.user_name);
  const avatarColor = getAvatarColor(booking.user_name);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="mb-3 overflow-hidden rounded-2xl bg-white"
      style={{
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: Colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/(tech-app)/(bookings)/${booking.id}` as any)}
      >
        <View className="flex-row items-center gap-3 p-4">
          {/* Avatar */}
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarColor }}
          >
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 15, color: Colors.white }}>
              {initials}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1">
            <Text
              style={{ fontFamily: "GoogleSans_700Bold", fontSize: 14, color: Colors.textPrimary }}
              numberOfLines={1}
            >
              {booking.user_name ?? "Unknown Client"}
            </Text>

            <View className="mt-0.5 flex-row items-center gap-1.5">
              <CategoryIcon size={12} color={categoryColor} strokeWidth={2} />
              <Text style={{ fontSize: 12, color: Colors.textSecondary }} numberOfLines={1}>
                {booking.service_name ?? "Service"}
              </Text>
            </View>

            <View className="mt-1 flex-row items-center gap-1">
              <Calendar size={11} color={Colors.textMuted} strokeWidth={2} />
              <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                {formatDate(booking.scheduled_date)}
              </Text>
            </View>
          </View>

          {/* Category badge */}
          <View
            className="h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${categoryColor}18` }}
          >
            <CategoryIcon size={18} color={categoryColor} strokeWidth={1.8} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
