import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { CalendarClock, Check, X } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

interface Props {
  readonly onComplete: () => void;
  readonly onReschedule: () => void;
  readonly onCancel: () => void;
  readonly isCompleting: boolean;
}

export default function BookingActionButtons({ onComplete, onReschedule, onCancel, isCompleting }: Props) {
  return (
    <View className="mt-2" style={{ gap: 10 }}>
      {/* Complete */}
      <TouchableOpacity
        onPress={onComplete}
        disabled={isCompleting}
        className="flex-row items-center justify-center gap-2 rounded-2xl py-4"
        style={{ backgroundColor: isCompleting ? Colors.borderLight : Colors.success }}
        activeOpacity={0.85}
      >
        {isCompleting ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            <Check size={18} color={Colors.white} strokeWidth={2.5} />
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 15, color: Colors.white }}>
              Complete Booking
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Reschedule */}
      <TouchableOpacity
        onPress={onReschedule}
        className="flex-row items-center justify-center gap-2 rounded-2xl border py-4"
        style={{ borderColor: Colors.borderLight, backgroundColor: Colors.white }}
        activeOpacity={0.7}
      >
        <CalendarClock size={18} color={Colors.textPrimary} strokeWidth={2} />
        <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 15, color: Colors.textPrimary }}>
          Reschedule
        </Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity
        onPress={onCancel}
        className="flex-row items-center justify-center gap-2 rounded-2xl border py-4"
        style={{ borderColor: Colors.error }}
        activeOpacity={0.7}
      >
        <X size={18} color={Colors.error} strokeWidth={2} />
        <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 15, color: Colors.error }}>
          Cancel Booking
        </Text>
      </TouchableOpacity>
    </View>
  );
}
