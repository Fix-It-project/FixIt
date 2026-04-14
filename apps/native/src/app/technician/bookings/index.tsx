import { SafeAreaView } from "react-native-safe-area-context";
import BookingListContent from "@/src/features/booking-orders/components/tech/BookingListContent";

export default function TechnicianBookingsScreen() {
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-surface-elevated">
      <BookingListContent />
    </SafeAreaView>
  );
}
