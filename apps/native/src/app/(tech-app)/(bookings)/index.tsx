import { useRef } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/lib/colors";
import { formatDateLabel, formatHeading, toIso } from "@/src/lib/helpers/date-helpers";
import { useBookingsDateStore } from "@/src/stores/bookings-date-store";
import { useTechBookingsQuery } from "@/src/hooks/tech/useTechBookingsQuery";
import { Text } from "@/src/components/ui/text";
import BookingCard from "@/src/components/tech/booking/BookingCard";
import BookingsEmptyState from "@/src/components/tech/booking/BookingsEmptyState";
import BookingsHeader, {
  type BookingsHeaderRef,
} from "@/src/components/tech/booking/BookingsHeader";

export default function BookingsScreen() {
  const { selectedDate } = useBookingsDateStore();
  const headerRef = useRef<BookingsHeaderRef>(null);
  const dateStr = toIso(selectedDate);
  const { data: bookings = [], isPending, isRefetching, refetch } = useTechBookingsQuery(dateStr);

  useFocusBackHandler(() => {
    if (headerRef.current?.closeCalendarIfOpen()) return true;
    return false;
  });

  return (
    <View className="flex-1 bg-surface-gray">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header (sticky) */}
        <BookingsHeader ref={headerRef} />

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[Colors.brand]}
              tintColor={Colors.brand}
            />
          }
        >
          {/* Date heading */}
          <View className="flex-row items-baseline justify-between px-4 pb-2 pt-5">
            <View>
              <Text
                style={{
                  fontFamily: "GoogleSans_700Bold",
                  fontSize: 18,
                  color: Colors.textPrimary,
                }}
              >
                {formatHeading(selectedDate)}
              </Text>
              <Text
                className="mt-0.5"
                style={{ fontSize: 13, color: Colors.textSecondary }}
              >
                {bookings.length} booking{bookings.length === 1 ? "" : "s"}
              </Text>
            </View>
            {bookings.length > 0 && (
              <Text
                style={{
                  fontFamily: "GoogleSans_600SemiBold",
                  fontSize: 12,
                  color: Colors.brand,
                }}
              >
                {formatDateLabel(selectedDate)}
              </Text>
            )}
          </View>

          {/* List or empty state */}
          <View className="px-4">
            {bookings.length === 0 && !isPending ? (
              <BookingsEmptyState />
            ) : (
              bookings.map((b, i) => (
                <BookingCard key={b.id} booking={b} index={i} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
