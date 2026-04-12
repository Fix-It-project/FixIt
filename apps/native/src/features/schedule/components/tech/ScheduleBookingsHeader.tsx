import { forwardRef, useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import NotificationBell from "@/src/components/ui/NotificationBell";
import BookingsCalendarSheet from "@/src/features/booking-orders/components/tech/BookingsCalendarSheet";
import BookingsWeekStrip from "@/src/features/booking-orders/components/tech/BookingsWeekStrip";
import { Colors, useThemeColors } from "@/src/lib/theme";
import ScheduleBookingsToggle from "./ScheduleViewToggle";
import type { BookingsCalendarSheetRef } from "@/src/features/booking-orders/components/tech/BookingsCalendarSheet";

export interface ScheduleBookingsHeaderRef {
  closeCalendarIfOpen: () => boolean;
}

interface Props {
  activeView: "schedule" | "bookings";
  onToggle: (view: "schedule" | "bookings") => void;
}

/**
 * Shared blue navbar for the unified Schedule/Bookings surface.
 * No back button — this is a root tab screen; system handles back.
 * When activeView === 'bookings', the week strip + jump button appear below the toggle.
 */
const ScheduleBookingsHeader = forwardRef<ScheduleBookingsHeaderRef, Props>(
  function ScheduleBookingsHeader({ activeView, onToggle }, ref) {
    const calendarRef = useRef<BookingsCalendarSheetRef>(null);
    const themeColors = useThemeColors();

    useImperativeHandle(
      ref,
      () => ({
        closeCalendarIfOpen: () => calendarRef.current?.closeIfOpen() ?? false,
      }),
      [],
    );

    return (
      <View
        style={{
          backgroundColor: Colors.primaryDark,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 8,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          shadowColor: Colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.18,
          shadowRadius: 10,
          elevation: 6,
        }}
      >
        {/* ── Top bar: title + bell ── */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mb-4 flex-row items-center justify-between"
        >
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: themeColors.surfaceBase,
            }}
          >
            Fix
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 26,
                color: Colors.accentSky,
              }}
            >
              IT
            </Text>
            {"  "}
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 22,
                color: themeColors.surfaceBase,
              }}
            >
              Technicians
            </Text>
          </Text>

          <NotificationBell />
        </Animated.View>

        {/* ── Schedule / Bookings toggle ── */}
        <ScheduleBookingsToggle activeView={activeView} onToggle={onToggle} />

        {/* ── Bookings-only extras: week strip + jump button ── */}
        {activeView === "bookings" && (
          <>
            <Animated.View
              entering={FadeInDown.delay(80).duration(300)}
              exiting={FadeOutUp.duration(200)}
            >
              <BookingsWeekStrip />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(160).duration(300)}
              exiting={FadeOutUp.duration(200)}
              className="mt-2.5 flex-row justify-end"
            >
              <BookingsCalendarSheet ref={calendarRef} />
            </Animated.View>
          </>
        )}
      </View>
    );
  },
);

export default ScheduleBookingsHeader;
