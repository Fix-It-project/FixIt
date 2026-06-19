import { useLocalSearchParams } from "expo-router";
import RescheduleScreen from "@/src/features/booking-orders/components/state-machine/shared/RescheduleScreen";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

export default function TechnicianRescheduleScreen() {
	const { id, technicianId } = useLocalSearchParams<{
		id: string;
		technicianId?: string;
	}>();
	const goBack = useSafeBack(ROUTES.technician.bookingDetail(id ?? ""));

	return (
		<RescheduleScreen
			viewer="technician"
			orderId={id ?? ""}
			technicianId={technicianId}
			onDone={goBack}
		/>
	);
}
