import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { useBookingsDateStore } from "@/src/stores/bookings-date-store";
import { useTechBookingsQuery } from "@/src/hooks/technicians/useTechBookingsQuery";
import BookingsHeader from "@/src/components/technicians-booking/BookingsHeader";
import BookingCard from "@/src/components/technicians-booking/BookingCard";
import BookingsEmptyState from "@/src/components/technicians-booking/BookingsEmptyState";

/** Format a Date to "YYYY-MM-DD". */
function toIso(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Format a Date for the heading, e.g. "Today's Bookings" or "Tuesday, Mar 18". */
function formatHeading(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(d);
  compare.setHours(0, 0, 0, 0);

  if (compare.getTime() === today.getTime()) return "Today's Bookings";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

/** Format a Date to "Mar 17, 2026". */
function formatDateLabel(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function BookingsScreen() {
  const { selectedDate } = useBookingsDateStore();
  const dateStr = toIso(selectedDate);
  const { data: bookings = [], isLoading } = useTechBookingsQuery(dateStr);

  return (
    <View className="flex-1 bg-surface-gray">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header (sticky) */}
        <BookingsHeader />

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
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
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
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
            {bookings.length === 0 && !isLoading ? (
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
