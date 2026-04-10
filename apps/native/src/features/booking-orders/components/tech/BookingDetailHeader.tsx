import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { ChevronLeft, ClipboardList, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { CATEGORIES } from "@/src/lib/categories";
import { Text } from "@/src/components/ui/text";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

interface Props {
  readonly booking: TechnicianOrder;
}

export default function BookingDetailHeader({ booking }: Props) {
  const category = CATEGORIES.find((c) => c.id === booking.category_id);
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
        Booking Details
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
