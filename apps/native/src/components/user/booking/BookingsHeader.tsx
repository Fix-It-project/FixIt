import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Bell, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/src/lib/colors";
import { TECH_PROFILE } from "@/src/lib/mock-data/tech";
import { Text } from "@/src/components/ui/text";
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

const BookingsHeader = forwardRef<BookingsHeaderRef, object>(function BookingsHeader(_, ref) {
  const router = useRouter();
  const profile = TECH_PROFILE;
  const calendarRef = useRef<BookingsCalendarSheetRef>(null);

  const handleBackPress = useCallback(() => {
    if (calendarRef.current?.closeIfOpen()) return;
    router.back();
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
        backgroundColor: Colors.brandDark,
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 8,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
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
            <ChevronLeft size={20} color={Colors.white} strokeWidth={2} />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              fontFamily: "GoogleSans_700Bold",
              fontSize: 22,
              color: Colors.white,
            }}
          >
            Fix
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 26,
                color: Colors.brandAccentText,
              }}
            >
              IT
            </Text>
            {"  "}
            <Text
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 22,
                color: Colors.white,
              }}
            >
              Technicians
            </Text>
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Online badge */}
          <View className="flex-row items-center gap-1.5">
            <Text
              className="font-bold text-xs uppercase"
              style={{
                color: profile.isOnline ? Colors.onlineGreen : Colors.overlaySub,
              }}
            >
              {profile.isOnline ? "Online" : "Offline"}
            </Text>
            <View
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: profile.isOnline ? Colors.onlineGreen : Colors.overlayDim,
              }}
            />
          </View>

          {/* Bell */}
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: Colors.overlayMd }}
            activeOpacity={0.7}
          >
            <Bell size={20} color={Colors.white} strokeWidth={1.8} />
            <View
              className="absolute top-2 right-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: Colors.error }}
            />
          </TouchableOpacity>
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
