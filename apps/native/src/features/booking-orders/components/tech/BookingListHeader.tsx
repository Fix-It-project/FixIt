import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";
import NotificationBell from "@/src/components/ui/NotificationBell";
import BookingsCalendarSheet, { type BookingsCalendarSheetRef } from "./BookingsCalendarSheet";
import BookingsViewToggle from "./BookingsViewToggle";
import BookingsWeekStrip from "./BookingsWeekStrip";

/**
 * Bookings page header.
 *
 * Contains: back button, title bar, online badge, bell icon,
 * schedule/bookings toggle (bookings active, schedule no-op),
 * the week strip, and the "Jump" button.
 */
export interface BookingsHeaderRef {
  closeCalendarIfOpen: () => boolean;
}

const BookingsHeader = forwardRef<BookingsHeaderRef, object>(function BookingListHeader(_, ref) {
  const router = useRouter();
  const calendarRef = useRef<BookingsCalendarSheetRef>(null);

  const handleBackPress = useCallback(() => {
    if (calendarRef.current?.closeIfOpen()) return;
    router.replace("/(tech-app)");
  }, [router]);

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
      {/* ── Top bar: back + title + online + bell ── */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="mb-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          {/* Back */}
          <TouchableOpacity
            onPress={handleBackPress}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: Colors.overlayMd }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={20} color={Colors.surfaceBase} strokeWidth={2} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: Colors.surfaceBase,
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
                color: Colors.surfaceBase,
              }}
            >
              Technicians
            </Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Bell */}
          <NotificationBell />
        </View>
      </Animated.View>

      {/* ── Schedule / Bookings toggle ── */}
      <BookingsViewToggle />

      {/* ── Week strip ── */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <BookingsWeekStrip />
      </Animated.View>

      {/* ── Jump button ── */}
      <Animated.View
        entering={FadeInDown.delay(240).duration(400)}
        className="mt-2.5 flex-row justify-end"
      >
        <BookingsCalendarSheet ref={calendarRef} />
      </Animated.View>
    </View>
  );
});

export default BookingsHeader;
