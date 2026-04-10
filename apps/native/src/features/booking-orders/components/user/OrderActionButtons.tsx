import { TouchableOpacity, View } from "react-native";
import { CalendarClock, X } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

interface Props {
  readonly onReschedule: () => void;
  readonly onCancel: () => void;
}

export default function OrderActionButtons({ onReschedule, onCancel }: Props) {
  return (
    <View className="mt-2" style={{ gap: 10 }}>
      {/* Reschedule */}
      <TouchableOpacity
        onPress={onReschedule}
        className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
        style={{ backgroundColor: Colors.primary }}
        activeOpacity={0.85}
      >
        <CalendarClock size={18} color={Colors.surfaceBase} strokeWidth={2} />
        <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 15, color: Colors.surfaceBase }}>
          Reschedule
        </Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity
        onPress={onCancel}
        className="flex-row items-center justify-center gap-2 rounded-2xl border py-4"
        style={{ borderColor: Colors.danger }}
        activeOpacity={0.7}
      >
        <X size={18} color={Colors.danger} strokeWidth={2} />
        <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 15, color: Colors.danger }}>
          Cancel Order
        </Text>
      </TouchableOpacity>
    </View>
  );
}
