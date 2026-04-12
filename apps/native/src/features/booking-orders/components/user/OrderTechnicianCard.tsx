import { Image, View } from "react-native";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { CATEGORIES } from "@/src/lib/categories";
import { getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

interface Props {
  readonly order: Order;
}

export default function OrderTechnicianCard({ order }: Props) {
  const category = order.category_id ? CATEGORIES.find((c) => c.id === order.category_id) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;
  const initials = getInitials(order.technician_name);
  const avatarColor = getAvatarColor(order.technician_name);

  return (
    <View
      className="mb-4 rounded-2xl bg-white p-5"
      style={{ borderWidth: 1, borderColor: Colors.borderDefault }}
    >
      <View className="flex-row items-center gap-4">
        {order.technician_image ? (
          <Image
            source={{ uri: order.technician_image }}
            className="h-16 w-16 rounded-full"
            style={{ backgroundColor: Colors.surfaceElevated }}
          />
        ) : (
          <View
            className="h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarColor }}
          >
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 20, color: Colors.surfaceBase }}>
              {initials}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: Colors.textPrimary }}
            numberOfLines={1}
          >
            {order.technician_name ?? "Technician"}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <CategoryIcon size={14} color={categoryColor} strokeWidth={2} />
            <Text style={{ fontSize: 13, color: Colors.textSecondary }}>
              {order.service_name ?? "Service"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
