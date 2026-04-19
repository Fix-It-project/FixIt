import { View, useWindowDimensions } from "react-native";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import type { TechnicianBooking } from "../../schemas/response.schema";

interface Props {
  readonly booking: TechnicianBooking;
}

export default function BookingClientCard({ booking }: Props) {
  const themeColors = useThemeColors();
  const { width } = useWindowDimensions();
  const category = CATEGORIES.find((c) => c.id === booking.category_id);
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? themeColors.primary;
  const initials = getPfpInitialsFallback(booking.user_name);
  const avatarColor = getAvatarColor(booking.user_name);
  const avatarSize = width < 360 ? 52 : 64;
  const nameFontSize = width < 360 ? 16 : 18;

  return (
    <View
      className="mb-4 rounded-2xl bg-surface p-5"
      style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
    >
      <View className="flex-row gap-4" style={{ alignItems: "center" }}>
        <View
          className="items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor, width: avatarSize, height: avatarSize }}
        >
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: avatarSize * 0.32,
              color: themeColors.surfaceBase,
            }}
          >
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: nameFontSize,
              color: themeColors.textPrimary,
            }}
            numberOfLines={2}
          >
            {booking.user_name ?? "Unknown Client"}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5" style={{ minWidth: 0 }}>
            <CategoryIcon size={14} color={categoryColor} strokeWidth={2} />
            <Text
              style={{ flex: 1, fontSize: 13, color: themeColors.textSecondary }}
              numberOfLines={2}
            >
              {booking.service_name ?? "Service"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
