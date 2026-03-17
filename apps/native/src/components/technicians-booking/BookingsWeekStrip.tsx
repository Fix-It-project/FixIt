import { View, TouchableOpacity, useWindowDimensions, I18nManager } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useBookingsDateStore } from "@/src/stores/bookings-date-store";
import { useTechBookingDatesQuery } from "@/src/hooks/technicians/useTechBookingsQuery";
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const today = new Date();
today.setHours(0, 0, 0, 0);

function getMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Horizontal week strip – 7 day circles, swipe left/right to navigate weeks with slide animation. */
export default function BookingsWeekStrip() {
  const { selectedDate, weekStart, setSelectedDate, goToPrevWeek, goToNextWeek } =
    useBookingsDateStore();
  const { data: bookingDates } = useTechBookingDatesQuery();
  const { width: screenWidth } = useWindowDimensions();

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

  const toIso = (d: Date) => d.toISOString().split("T")[0];

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
      runOnJS(goFn)();
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
    <Animated.View
      entering={FadeIn.duration(300)}
      className="px-1"
      style={{ overflow: "hidden" }}
    >
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
                  width: 44,
                  height: 44,
                  opacity: isPast ? 0.35 : 1,
                  backgroundColor: selected ? Colors.brand : Colors.white,
                  shadowColor: selected ? Colors.brand : "#000",
                  shadowOffset: { width: 0, height: selected ? 3 : 1 },
                  shadowOpacity: selected ? 0.35 : 0.08,
                  shadowRadius: selected ? 6 : 3,
                  elevation: selected ? 4 : 2,
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 8,
                    textTransform: "uppercase",
                    color: selected ? "rgba(255,255,255,0.7)" : Colors.textSecondary,
                    lineHeight: 10,
                  }}
                >
                  {DAYS[i]}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "GoogleSans_700Bold",
                    color: selected ? Colors.white : Colors.textPrimary,
                    lineHeight: 18,
                  }}
                >
                  {day.getDate()}
                </Text>

                {hasBookings && (
                  <View
                    style={{
                      position: "absolute",
                      bottom: 3,
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: selected ? Colors.white : Colors.star,
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
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" }} />
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.7)" }} />
        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.4)" }} />
      </View>
    </Animated.View>
  );
}
