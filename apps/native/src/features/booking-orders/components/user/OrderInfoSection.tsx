import { Calendar, Phone } from "lucide-react-native";
import { Linking } from "react-native";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import InfoSection, { type InfoSectionRow } from "@/src/features/booking-orders/components/shared/InfoSection";
import { formatDate } from "@/src/features/booking-orders/utils/booking-helpers";

interface Props {
  readonly order: Order;
}

export default function OrderInfoSection({ order }: Props) {
  const rows: InfoSectionRow[] = [
    {
      icon: Calendar,
      label: "Scheduled Date",
      value: formatDate(order.scheduled_date),
    },
  ];

  if (order.technician_phone) {
    rows.push({
      icon: Phone,
      label: "Technician Phone",
      value: order.technician_phone,
      onPress: () => Linking.openURL(`tel:${order.technician_phone}`),
    });
  }

  return <InfoSection rows={rows} />;
}
