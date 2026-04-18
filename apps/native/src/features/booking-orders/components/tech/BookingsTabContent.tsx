import { useRef } from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import NotificationBell from "@/src/components/ui/NotificationBell";
import { Text } from "@/src/components/ui/text";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { Colors, useThemeColors } from "@/src/lib/theme";
import BookingListContent from "./BookingListContent";
import BookingsCalendarSheet, {
  type BookingsCalendarSheetRef,
} from "./BookingsCalendarSheet";
import BookingsWeekStrip from "./BookingsWeekStrip";

export default function BookingsTabContent() {
  const themeColors = useThemeColors();
  const calendarRef = useRef<BookingsCalendarSheetRef>(null);

  useFocusBackHandler(() => calendarRef.current?.closeIfOpen() ?? false);

  return (
    <View className="flex-1 bg-surface-elevated">
      <View
        style={{
          backgroundColor: Colors.primaryDark,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 10,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mb-4 flex-row items-center justify-between"
        >
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: themeColors.onPrimaryHeader,
            }}
          >
            Fix
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 26,
                color: themeColors.accentSky,
              }}
            >
              IT
            </Text>
            {"  "}
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 22,
                color: themeColors.onPrimaryHeader,
              }}
            >
              Technicians
            </Text>
          </Text>

          <NotificationBell />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(300)}>
          <BookingsWeekStrip />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(160).duration(300)}
          className="mt-2.5 flex-row justify-end"
        >
          <BookingsCalendarSheet ref={calendarRef} />
        </Animated.View>
      </View>

      <BookingListContent />
    </View>
  );
}
