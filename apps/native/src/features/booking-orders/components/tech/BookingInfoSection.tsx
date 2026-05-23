import { Calendar, MapPin, Phone } from "lucide-react-native";
import { Linking } from "react-native";
import InfoSection, {
	type InfoSectionRow,
} from "@/src/features/booking-orders/components/shared/InfoSection";
import {
	formatDate,
	formatTime,
} from "@/src/features/booking-orders/utils/booking-helpers";
import type { TechnicianBooking } from "../../schemas/response.schema";

interface Props {
	readonly booking: TechnicianBooking;
}

export default function BookingInfoSection({ booking }: Props) {
	const scheduledTime = formatTime(booking.scheduled_start_at);
	const rows: InfoSectionRow[] = [
		{
			icon: Calendar,
			label: "Scheduled Date",
			value: formatDate(booking.scheduled_date),
		},
	];

	if (scheduledTime) {
		rows.push({
			icon: Calendar,
			label: "Scheduled Time",
			value: scheduledTime,
		});
	}

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
