import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "@/src/constants/design-tokens";
import { OrderSummaryScreen } from "@/src/features/booking-orders/components/state-machine/shared";
import { useUserOrderById } from "@/src/features/booking-orders/hooks/useUserOrders";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

export default function UserOrderSummaryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const themeColors = useThemeColors();
	const order = useUserOrderById(id ?? "");
	const goBack = useSafeBack(ROUTES.user.activity);

	if (!order) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	}

	return <OrderSummaryScreen order={order} viewer="user" onBack={goBack} />;
}
