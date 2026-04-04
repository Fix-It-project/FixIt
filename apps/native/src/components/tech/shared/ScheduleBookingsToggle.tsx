import { useEffect, useRef, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

interface Props {
  activeView: "schedule" | "bookings";
  onToggle: (view: "schedule" | "bookings") => void;
}

/**
 * Animated sliding pill toggle for Schedule ↔ Bookings.
 * The white pill translates horizontally using Reanimated; tapping the
 * inactive side fires onToggle — no navigation involved.
 */
export default function ScheduleBookingsToggle({ activeView, onToggle }: Props) {
  const [pillWidth, setPillWidth] = useState(0);
  const pillPosition = useSharedValue(activeView === "bookings" ? 1 : 0);
  const hasLayout = useRef(false);

  // Sync pill position whenever activeView changes
  useEffect(() => {
    pillPosition.value = withTiming(activeView === "bookings" ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
  }, [activeView, pillPosition]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillPosition.value * pillWidth }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(80).duration(400)}
      className="mb-4 flex-row rounded-xl p-1"
      style={{ backgroundColor: Colors.overlaySm }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (hasLayout.current) return;
        hasLayout.current = true;
        // Each pill occupies half the container minus the 8px total padding (p-1 = 4 each side)
        const half = (w - 8) / 2;
        setPillWidth(half);
        // Set initial position without animation on first layout
        pillPosition.value = activeView === "bookings" ? half : 0;
      }}
    >
      {/* Animated white pill (absolute, behind text) */}
      {pillWidth > 0 && (
        <Animated.View
          style={[
            pillStyle,
            {
              position: "absolute",
              top: 4,
              left: 4,
              width: pillWidth,
              bottom: 4,
              borderRadius: 8,
              backgroundColor: Colors.white,
              shadowColor: Colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        />
      )}

      {/* Schedule tap target */}
      <TouchableOpacity
        className="flex-1 items-center justify-center py-2.5"
        activeOpacity={0.7}
        onPress={() => onToggle("schedule")}
      >
        <Text
          style={{
            fontFamily: "GoogleSans_600SemiBold",
            fontSize: 14,
            color: activeView === "schedule" ? Colors.brand : Colors.overlaySub,
          }}
        >
          Schedule
        </Text>
      </TouchableOpacity>

      {/* Bookings tap target */}
      <TouchableOpacity
        className="flex-1 items-center justify-center py-2.5"
        activeOpacity={0.7}
        onPress={() => onToggle("bookings")}
      >
        <Text
          style={{
            fontFamily: "GoogleSans_600SemiBold",
            fontSize: 14,
            color: activeView === "bookings" ? Colors.brand : Colors.overlaySub,
          }}
        >
          Bookings
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
