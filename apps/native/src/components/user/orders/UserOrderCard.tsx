import { Image, TouchableOpacity, View } from "react-native";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { CATEGORIES } from "@/src/lib/categories";
import { formatDate, getInitials, getAvatarColor } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/services/orders/schemas/response.schema";
import type { OrderStatus } from "@/src/schemas/shared.schema";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
  accepted: { label: "Accepted", color: Colors.success, bg: "#d1fae5" },
  rejected: { label: "Rejected", color: Colors.error, bg: "#fee2e2" },
  cancelled_by_user: { label: "Cancelled", color: Colors.error, bg: "#fee2e2" },
  cancelled_by_technician: { label: "Cancelled by tech", color: Colors.error, bg: "#fee2e2" },
  completed: { label: "Completed", color: Colors.success, bg: "#d1fae5" },
};

interface Props {
  readonly order: Order;
  readonly onPress: () => void;
}

export default function UserOrderCard({ order, onPress }: Props) {
  const category = order.category_id ? CATEGORIES.find((c) => c.id === order.category_id) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.brand;
  const initials = getInitials(order.technician_name);
  const avatarColor = getAvatarColor(order.technician_name);
  const status = STATUS_CONFIG[order.status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mb-3 rounded-2xl bg-white p-4"
      style={{ borderWidth: 1, borderColor: Colors.borderLight }}
    >
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        {order.technician_image ? (
          <Image
            source={{ uri: order.technician_image }}
            className="h-12 w-12 rounded-full"
            style={{ backgroundColor: Colors.surfaceGray }}
          />
        ) : (
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarColor }}
          >
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 16, color: Colors.white }}>
              {initials}
            </Text>
          </View>
        )}

        {/* Info */}
        <View className="flex-1">
          <Text
            style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 15, color: Colors.textPrimary }}
            numberOfLines={1}
          >
            {order.technician_name ?? "Technician"}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <CategoryIcon size={13} color={categoryColor} strokeWidth={2} />
            <Text style={{ fontSize: 12, color: Colors.textSecondary }} numberOfLines={1}>
              {order.service_name ?? "Service"}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: status.bg }}
        >
          <Text style={{ fontSize: 11, fontFamily: "GoogleSans_600SemiBold", color: status.color }}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Date row */}
      <View className="mt-3 flex-row items-center justify-between border-t pt-3" style={{ borderColor: Colors.borderLight }}>
        <Text style={{ fontSize: 12, color: Colors.textMuted }}>
          {formatDate(order.scheduled_date)}
        </Text>
        <Text style={{ fontSize: 12, color: Colors.brand, fontFamily: "GoogleSans_600SemiBold" }}>
          View Details
        </Text>
      </View>
    </TouchableOpacity>
  );
}
