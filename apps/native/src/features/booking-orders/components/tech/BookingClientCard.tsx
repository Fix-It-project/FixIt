import { View } from "react-native";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

interface Props {
  readonly booking: TechnicianOrder;
}

export default function BookingClientCard({ booking }: Props) {
  const themeColors = useThemeColors();
  const category = CATEGORIES.find((c) => c.id === booking.category_id);
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;
  const initials = getInitials(booking.user_name);
  const avatarColor = getAvatarColor(booking.user_name);

  return (
    <View
      className="mb-4 rounded-2xl bg-surface p-5"
      style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
    >
      <View className="flex-row items-center gap-4">
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: avatarColor }}
        >
          <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 20, color: themeColors.surfaceBase }}>
            {initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text
            style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: themeColors.textPrimary }}
            numberOfLines={1}
          >
            {booking.user_name ?? "Unknown Client"}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <CategoryIcon size={14} color={categoryColor} strokeWidth={2} />
            <Text style={{ fontSize: 13, color: themeColors.textSecondary }}>
              {booking.service_name ?? "Service"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
