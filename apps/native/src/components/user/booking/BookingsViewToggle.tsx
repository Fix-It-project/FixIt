import { TouchableOpacity, View } from "react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";
import Animated, { FadeInDown } from "react-native-reanimated";

/** Schedule / Bookings pill toggle — Bookings tab is always active for now. */
export default function BookingsViewToggle() {
  return (
    <Animated.View
      entering={FadeInDown.delay(80).duration(400)}
      className="mb-4 flex-row rounded-xl p-1"
      style={{ backgroundColor: Colors.overlaySm }}
    >
      {/* Schedule (no-op) */}
      <TouchableOpacity
        className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5"
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontFamily: "GoogleSans_600SemiBold",
            fontSize: 14,
            color: Colors.overlaySub,
          }}
        >
          Schedule
        </Text>
      </TouchableOpacity>

      {/* Bookings (active) */}
      <View
        className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5"
        style={{
          backgroundColor: Colors.white,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text
          style={{
            fontFamily: "GoogleSans_600SemiBold",
            fontSize: 14,
            color: Colors.brand,
          }}
        >
          Bookings
        </Text>
      </View>
    </Animated.View>
  );
}
