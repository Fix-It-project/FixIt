import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "@/src/constants/design-tokens";
import { OrderSummaryScreen } from "@/src/features/booking-orders/components/state-machine/shared";
import { useTechnicianBookingById } from "@/src/features/booking-orders/hooks/useTechnicianBookingsQuery";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

export default function TechnicianBookingSummaryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const themeColors = useThemeColors();
	const booking = useTechnicianBookingById(id ?? "");
	const goBack = useSafeBack(ROUTES.technician.jobs);

	if (!booking) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	}

	return (
		<OrderSummaryScreen
			order={booking as unknown as Order}
			viewer="technician"
			onBack={goBack}
		/>
	);
}
