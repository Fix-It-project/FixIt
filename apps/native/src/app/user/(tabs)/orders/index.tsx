import { router } from "expo-router";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import OrdersHeader from "@/src/features/booking-orders/components/user/OrdersHeader";
import UserOrderCard from "@/src/features/booking-orders/components/user/UserOrderCard";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";
import { Colors, spacing, useThemeColors } from "@/src/lib/theme";

export default function MyOrdersScreen() {
	const themeColors = useThemeColors();
	const {
		data: orders = [],
		isLoading,
		refetch,
		isRefetching,
	} = useUserOrdersQuery();
	const goToOrder = useDebounce((id: string) =>
		router.push(ROUTES.user.orderDetail(id)),
	);
	const isRefreshing = isRefetching && !isLoading;

	return (
		<View className="flex-1 bg-surface-elevated">
			<SafeAreaView className="flex-1" edges={["top"]}>
				<OrdersHeader />

				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<ActivityIndicator size="large" color={Colors.primary} />
					</View>
				) : (
					<ScrollView
						className="flex-1"
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{
							padding: spacing.card.padding,
							paddingBottom: spacing.screen.paddingBottom + spacing.stack.lg,
							flexGrow: orders.length === 0 ? 1 : undefined,
						}}
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={refetch}
								tintColor={Colors.primary}
							/>
						}
					>
						{orders.length === 0 ? (
							<View className="flex-1 items-center justify-center px-button-lg-x">
								<Text
									variant="buttonLg"
									style={{
										color: themeColors.textSecondary,
										textAlign: "center",
									}}
								>
									No orders yet
								</Text>
								<Text
									variant="bodySm"
									className="mt-stack-xs text-center"
									style={{ color: themeColors.textMuted }}
								>
									Your bookings will appear here once you book a technician.
								</Text>
							</View>
						) : (
							orders.map((order) => (
								<UserOrderCard
									key={order.id}
									order={order}
									onPress={() => goToOrder(order.id)}
								/>
							))
						)}
					</ScrollView>
				)}
			</SafeAreaView>
		</View>
	);
}
