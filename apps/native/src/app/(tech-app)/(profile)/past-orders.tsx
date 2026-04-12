import { ScrollView, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ChevronLeft, ClipboardList, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/theme";
import { useThemeColors } from "@/src/lib/theme";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { formatDate, getAvatarColor, getInitials } from "@/src/lib/helpers/booking-helpers";
import { Text } from "@/src/components/ui/text";
import { useTechPastOrders } from "@/src/hooks/tech/useTechBookingsQuery";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

function statusLabel(status: string): string {
  if (status === "completed") return "Completed";
  if (status === "cancelled_by_user") return "Cancelled by client";
  return "Cancelled";
}

function statusColor(status: string): string {
  return status === "completed" ? Colors.success : Colors.danger;
}

function PastOrderCard({ order }: { readonly order: TechnicianOrder }) {
  const themeColors = useThemeColors();
  const category = CATEGORIES.find((c) => c.id === order.category_id);
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;
  const color = statusColor(order.status);
  const goToOrder = useDebounce(() => router.push(`/(tech-app)/(bookings)/${order.id}` as any));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={goToOrder}
      className="mb-3 rounded-2xl bg-surface p-4"
      style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
    >
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: getAvatarColor(order.user_name) }}
        >
          <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 14, color: themeColors.surfaceBase }}>
            {getInitials(order.user_name)}
          </Text>
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text
            style={{ fontFamily: "GoogleSans_700Bold", fontSize: 14, color: themeColors.textPrimary }}
            numberOfLines={1}
          >
            {order.user_name ?? "Unknown Client"}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <CategoryIcon size={12} color={categoryColor} strokeWidth={2} />
            <Text style={{ fontSize: 12, color: themeColors.textSecondary }} numberOfLines={1}>
              {order.service_name ?? "Service"}
            </Text>
          </View>
        </View>

        {/* Date + status */}
        <View className="items-end">
          <Text style={{ fontSize: 11, color: themeColors.textMuted }}>
            {formatDate(order.scheduled_date)}
          </Text>
          <View
            className="mt-1 rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: `${color}15` }}
          >
            <Text style={{ fontSize: 10, fontFamily: "GoogleSans_600SemiBold", color }}>
              {statusLabel(order.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function PastOrdersScreen() {
  const themeColors = useThemeColors();
  const { data: orders } = useTechPastOrders();

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View
          className="flex-row items-center gap-3 px-4 pb-4 pt-2"
          style={{ backgroundColor: themeColors.surfaceBase }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.surfaceElevated }}
          >
            <ChevronLeft size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: themeColors.textPrimary }}>
            Past Orders
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {orders.length === 0 ? (
            <View className="items-center py-16">
              <Text style={{ fontSize: 14, color: themeColors.textMuted }}>No past orders yet</Text>
            </View>
          ) : (
            orders.map((o) => <PastOrderCard key={o.id} order={o} />)
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
