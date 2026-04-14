import { Linking } from "react-native";
import { Calendar, MapPin, Phone } from "lucide-react-native";
import { formatDate } from "@/src/lib/helpers/booking-helpers";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";
import InfoSection, { type InfoSectionRow } from "@/src/features/booking-orders/components/shared/InfoSection";

interface Props {
  readonly booking: TechnicianOrder;
}

export default function BookingInfoSection({ booking }: Props) {
  const rows: InfoSectionRow[] = [
    {
      icon: Calendar,
      label: "Scheduled Date",
      value: formatDate(booking.scheduled_date),
    },
  ];

  if (booking.user_address) {
    const address = booking.user_address;
    rows.push({
      icon: MapPin,
      label: "Location",
      value: address,
      onPress: () =>
        Linking.openURL(
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        ),
    });
  }

  if (booking.user_phone) {
    rows.push({
      icon: Phone,
      label: "Phone",
      value: booking.user_phone,
      onPress: () => Linking.openURL(`tel:${booking.user_phone}`),
    });
  }

  return <InfoSection rows={rows} />;
}
