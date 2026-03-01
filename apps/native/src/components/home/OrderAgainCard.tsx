import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { PREVIOUS_ORDERS } from "@/src/lib/mock-data";

export default function OrderAgainCard() {
  const order = PREVIOUS_ORDERS[0];
  if (!order) return null;

  return (
    <View className="mx-5 mb-2">
      <View
        className="overflow-hidden rounded-2xl bg-white p-4"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Top row: label + action */}
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: order.categoryColor }}
            />
            <Text className="text-xs font-medium text-content-muted">
              Previous Order
            </Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center gap-0.5"
            activeOpacity={0.7}
          >
            <Text
              className="text-[13px] font-semibold"
              style={{ color: Colors.brand }}
            >
              Order Again
            </Text>
            <ChevronRight size={14} color={Colors.brand} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Technician info */}
        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: order.categoryColor }}
          >
            <Text className="text-[15px] font-bold text-white">
              {order.technicianName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </Text>
          </View>

          {/* Details */}
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-content">
              {order.technicianName}
            </Text>
            <Text className="mt-0.5 text-[13px] text-content-muted">
              {order.category} · {order.date}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
