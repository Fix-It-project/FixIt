import { I18nManager, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { toIso } from "@/src/lib/helpers/date-helpers";
import { getMonday, useBookingsDateStore } from "@/src/stores/bookings-date-store";
import { useTechBookingDatesQuery } from "@/src/hooks/tech/useTechBookingsQuery";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const today = new Date();
today.setHours(0, 0, 0, 0);

/** Horizontal week strip – 7 day circles, swipe left/right to navigate weeks with slide animation. */
export default function BookingsWeekStrip() {
  const themeColors = useThemeColors();
  const { selectedDate, weekStart, setSelectedDate, goToPrevWeek, goToNextWeek } =
    useBookingsDateStore();
  const { data: bookingDates } = useTechBookingDatesQuery();
  const { width: screenWidth } = useWindowDimensions();

  // Responsive circle size: fit 7 circles with gaps inside the strip (px-1 = 4px each side)
  const availableWidth = screenWidth - 8; // px-1 padding on each side
  const circleSize = Math.min(44, Math.floor((availableWidth - 6 * 8) / 7)); // 6 gaps of ~8px

  const translateX = useSharedValue(0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  /**
   * direction: 1 = slide left, -1 = slide right.
   * Slides the strip out, updates the store, then slides the new week in.
   */
  const runSlide = (direction: number, goFn: () => void) => {
    translateX.value = withTiming(direction * -screenWidth, { duration: 180 }, (finished) => {
      "worklet";
      if (!finished) return;
      scheduleOnRN(goFn);
      translateX.value = direction * screenWidth;
      translateX.value = withTiming(0, { duration: 180 });
    });
  };

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      const swipedLeft = e.translationX < -30;
      const swipedRight = e.translationX > 30;
      if (!swipedLeft && !swipedRight) return;

      const goToPrev = I18nManager.isRTL ? swipedLeft : swipedRight;
      const goToNext = I18nManager.isRTL ? swipedRight : swipedLeft;
      const canGoPrevWeek = weekStart.getTime() > getMonday(new Date()).getTime();
      const slideDirection = swipedLeft ? 1 : -1;

      if (goToNext) {
        runSlide(slideDirection, goToNextWeek);
      } else if (goToPrev) {
        // Do not play backward animation when we're already at current week.
        if (!canGoPrevWeek) return;
        runSlide(slideDirection, goToPrevWeek);
      }
    });

  return (
    <View className="px-1" style={{ overflow: "hidden" }}>
      <GestureDetector gesture={swipeGesture}>
        <Animated.View className="flex-row justify-around" style={animatedStyle}>
          {days.map((day, i) => {
            const selected = isSameDay(day, selectedDate);
            const isPast = day < today;
            const hasBookings = bookingDates?.has(toIso(day)) ?? false;

            return (
              <TouchableOpacity
                key={toIso(day)}
                onPress={() => !isPast && setSelectedDate(day)}
                disabled={isPast}
                className="items-center justify-center rounded-full"
                style={{
                  width: circleSize,
                  height: circleSize,
                  opacity: isPast ? 0.35 : 1,
                  backgroundColor: selected ? themeColors.primary : themeColors.surfaceBase,
                  shadowColor: selected ? themeColors.primary : themeColors.shadow,
                  shadowOffset: { width: 0, height: selected ? 3 : 1 },
                  shadowOpacity: selected ? 0.35 : 0.08,
                  shadowRadius: selected ? 6 : 3,
                  elevation: selected ? 4 : 2,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: Math.max(7, circleSize * 0.18),
                    textTransform: "uppercase",
                    color: selected ? themeColors.overlayBright : themeColors.textSecondary,
                    lineHeight: Math.max(9, circleSize * 0.23),
                  }}
                >
                  {DAYS[i]}
                </Text>
                <Text
                  style={{
                    fontSize: Math.max(11, circleSize * 0.32),
                    fontFamily: "GoogleSans_700Bold",
                    color: selected ? themeColors.surfaceBase : themeColors.textPrimary,
                    lineHeight: Math.max(14, circleSize * 0.41),
                  }}
                >
                  {day.getDate()}
                </Text>

                {hasBookings && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: Math.max(2, circleSize * 0.07),
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: selected
                        ? themeColors.surfaceOnPrimary
                        : themeColors.ratingDefault,
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </GestureDetector>

      {/* Swipe indicator dots */}
      <View className="mt-2 flex-row items-center justify-center gap-1">
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: themeColors.overlayDim }} />
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: themeColors.overlayBright }} />
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: themeColors.overlayDim }} />
      </View>
    </View>
  );
}
