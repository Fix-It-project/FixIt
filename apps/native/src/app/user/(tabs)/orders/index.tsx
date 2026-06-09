import { router } from "expo-router";
import { Star } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	View,
} from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import UserOrderCard from "@/src/features/booking-orders/components/user/UserOrderCard";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import { reviewSheetRef } from "@/src/features/reviews/components/user/ReviewPromptHost";
import { useReviewPromptStore } from "@/src/features/reviews/stores/review-prompt-store";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import { Colors, spacing, useThemeColors } from "@/src/constants/design-tokens";

export default function MyOrdersScreen() {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const {
		data: orders = [],
		isLoading,
		refetch,
		isRefetching,
	} = useUserOrdersQuery();
	const hasSubmitted = useReviewPromptStore((s) => s.hasSubmitted);
	const goToOrder = useDebounce((id: string) =>
		router.push(ROUTES.user.orderDetail(id)),
	);
	const isRefreshing = isRefetching && !isLoading;

	return (
		<View className="flex-1 bg-surface">
			<View
				className="min-h-header px-screen-x pt-card pb-card"
				style={{ backgroundColor: themeColors.surfaceBase }}
			>
				<Text variant="h3" style={{ color: themeColors.textPrimary }}>
					{t("list.title")}
				</Text>
			</View>

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
								{t("list.emptyTitle")}
							</Text>
							<Text
								variant="bodySm"
								className="mt-stack-xs text-center"
								style={{ color: themeColors.textMuted }}
							>
								{t("list.emptyBody")}
							</Text>
						</View>
					) : (
						orders.map((order) => {
							const showLeaveReview =
								order.status === "completed" &&
								!order.has_review &&
								!hasSubmitted(order.id);
							return (
								<UserOrderCard
									key={order.id}
									order={order}
									onPress={() => goToOrder(order.id)}
									actionSlot={
										showLeaveReview ? (
											<Button
												variant="ghost"
												size="md"
												iconLeft={
													<Star
														size={14}
														color={themeColors.ratingDefault}
														fill={themeColors.ratingDefault}
														strokeWidth={0}
													/>
												}
												onPress={() =>
													reviewSheetRef.current?.open(
														order.id,
														order.technician_id,
														order.technician_name ?? t("card.technicianFallback"),
													)
												}
												accessibilityLabel={t("list.leaveReviewA11y", {
													name:
														order.technician_name ?? t("card.technicianFallback"),
												})}
											>
												{t("list.leaveReview")}
											</Button>
										) : undefined
									}
								/>
							);
						})
					)}
				</ScrollView>
			)}
		</View>
	);
}
