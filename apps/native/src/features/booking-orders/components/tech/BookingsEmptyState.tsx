import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { CalendarOff } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import Animated, { FadeIn } from "react-native-reanimated";

/** Shown when the selected day has no bookings. */
export default function BookingsEmptyState() {
  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="items-center justify-center px-6 py-16"
    >
      {/* Icon */}
      <View
        className="mb-5 h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: Colors.primaryLight }}
      >
        <CalendarOff size={36} color={Colors.primary} strokeWidth={1.5} />
      </View>

      <Text
        style={{
          fontFamily: "GoogleSans_700Bold",
          fontSize: 20,
          color: Colors.textPrimary,
          textAlign: "center",
        }}
      >
        All clear for today
      </Text>
      <Text
        className="mt-2"
        style={{
          fontSize: 14,
          color: Colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        No bookings scheduled. Enjoy your free time{"\n"}or check another day!
      </Text>
    </Animated.View>
  );
}
