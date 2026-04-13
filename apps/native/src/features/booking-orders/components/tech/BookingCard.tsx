import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useDebounce } from "@/src/hooks/useDebounce";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, ClipboardList, type LucideIcon } from "lucide-react-native";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { formatDate, getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import { ROUTES } from "@/src/lib/routes";
import { useThemeColors } from "@/src/lib/theme";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

interface BookingCardProps {
  readonly booking: TechnicianOrder;
  readonly index: number;
}

export default function BookingCard({ booking, index }: BookingCardProps) {
  const themeColors = useThemeColors();
  const goToBooking = useDebounce(() => router.push(ROUTES.technician.bookingDetail(booking.id)));
  const category = CATEGORIES.find((c) => c.id === booking.category_id);
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? themeColors.primary;
  const initials = getInitials(booking.user_name);
  const avatarColor = getAvatarColor(booking.user_name);
  const isCancelled = booking.status === "cancelled_by_user" || booking.status === "cancelled_by_technician";
  const isCompleted = booking.status === "completed";
  let statusLabel: string | null = null;
  let statusColor: string | null = null;

  if (isCancelled) {
    statusLabel =
      booking.status === "cancelled_by_user" ? "Cancelled by client" : "Cancelled";
    statusColor = themeColors.danger;
  } else if (isCompleted) {
    statusLabel = "Completed";
    statusColor = themeColors.success;
  }

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      className="mb-3"
    >
      <View
        className="overflow-hidden rounded-2xl bg-surface"
        style={{
          borderWidth: 1,
          borderColor: isCancelled ? `${themeColors.danger}30` : themeColors.borderDefault,
          opacity: isCancelled ? 0.7 : 1,
          shadowColor: themeColors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={goToBooking}
        >
          <View className="flex-row items-center gap-3 p-4">
            {/* Avatar */}
            <View
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: avatarColor }}
            >
              <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 15, color: themeColors.surfaceBase }}>
                {initials}
              </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
              <Text
                style={{ fontFamily: "GoogleSans_700Bold", fontSize: 14, color: themeColors.textPrimary }}
                numberOfLines={1}
              >
                {booking.user_name ?? "Unknown Client"}
              </Text>

              <View className="mt-0.5 flex-row items-center gap-1.5">
                <CategoryIcon size={12} color={categoryColor} strokeWidth={2} />
                <Text style={{ fontSize: 12, color: themeColors.textSecondary }} numberOfLines={1}>
                  {booking.service_name ?? "Service"}
                </Text>
              </View>

              <View className="mt-1 flex-row items-center gap-1">
                <Calendar size={11} color={themeColors.textMuted} strokeWidth={2} />
                <Text style={{ fontSize: 11, color: themeColors.textMuted }}>
                  {formatDate(booking.scheduled_date)}
                </Text>
              </View>

              {/* Status badge */}
              {statusLabel && statusColor && (
                <View
                  className="mt-1.5 self-start rounded-full px-2.5 py-0.5"
                  style={{ backgroundColor: `${statusColor}15` }}
                >
                  <Text style={{ fontSize: 10, fontFamily: "GoogleSans_600SemiBold", color: statusColor }}>
                    {statusLabel}
                  </Text>
                </View>
              )}
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
      </View>
    </Animated.View>
  );
}
