import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ClipboardList, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { CATEGORIES } from "@/src/lib/categories";
import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

interface Props {
  readonly order: Order;
}

export default function OrderDetailHeader({ order }: Props) {
  const category = order.category_id ? CATEGORIES.find((c) => c.id === order.category_id) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;

  return (
    <View
      className="flex-row items-center gap-3 px-4 pb-4 pt-2"
      style={{ backgroundColor: Colors.surfaceBase }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: Colors.surfaceElevated }}
      >
        <ChevronLeft size={20} color={Colors.textPrimary} />
      </TouchableOpacity>
      <Text
        style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: Colors.textPrimary, flex: 1 }}
      >
        Order Details
      </Text>
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${categoryColor}18` }}
      >
        <CategoryIcon size={18} color={categoryColor} strokeWidth={1.8} />
      </View>
    </View>
  );
}
