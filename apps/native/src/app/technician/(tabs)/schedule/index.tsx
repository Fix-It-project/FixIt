import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import BookingListContent from "@/src/features/booking-orders/components/tech/BookingListContent";
import ScheduleScreen from "@/src/features/schedule/components/tech/ScheduleScreen";
import ScheduleBookingsHeader, {
  type ScheduleBookingsHeaderRef,
} from "@/src/features/schedule/components/tech/ScheduleBookingsHeader";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";

type ActiveView = "schedule" | "bookings";

export default function UnifiedSchedulePage() {
  const params = useLocalSearchParams<{ view?: string }>();
  const [activeView, setActiveView] = useState<ActiveView>(
    params.view === "bookings" ? "bookings" : "schedule",
  );
  const headerRef = useRef<ScheduleBookingsHeaderRef>(null);

  // When the Schedule footer tab is tapped with no params, default back to schedule view
  useFocusEffect(
    useCallback(() => {
      setActiveView(params.view === "bookings" ? "bookings" : "schedule");
    }, [params.view]),
  );

  // Only intercept back to close the calendar sheet; otherwise let system handle root-tab back
  useFocusBackHandler(() => {
    if (activeView === "bookings" && headerRef.current?.closeCalendarIfOpen()) return true;
    return false;
  });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-elevated">
      <ScheduleBookingsHeader ref={headerRef} activeView={activeView} onToggle={setActiveView} />

      {activeView === "schedule" ? (
        <Animated.View key="schedule" entering={FadeIn.duration(200)} className="flex-1">
          <ScheduleScreen onDismissSetup={() => setActiveView("bookings")} />
        </Animated.View>
      ) : (
        <Animated.View key="bookings" entering={FadeIn.duration(200)} className="flex-1">
          <BookingListContent />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
