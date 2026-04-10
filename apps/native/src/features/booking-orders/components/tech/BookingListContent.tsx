import { RefreshControl, ScrollView, View } from "react-native";
import { Colors } from "@/src/lib/colors";
import { formatDateLabel, formatHeading, toIso } from "@/src/lib/helpers/date-helpers";
import { useBookingsDateStore } from "@/src/stores/bookings-date-store";
import { useTechBookingsQuery } from "@/src/hooks/tech/useTechBookingsQuery";
import { Text } from "@/src/components/ui/text";
import BookingCard from "./BookingCard";
import BookingsEmptyState from "./BookingsEmptyState";

/**
 * Booking list body — scrollable content rendered below ScheduleBookingsHeader
 * when the unified Schedule/Bookings surface is in "bookings" mode.
 */
export default function BookingListContent() {
  const { selectedDate } = useBookingsDateStore();
  const dateStr = toIso(selectedDate);
  const { data: bookings = [], isPending, isRefetching, refetch } = useTechBookingsQuery(dateStr);

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
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
              color: Colors.primary,
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
  );
}
