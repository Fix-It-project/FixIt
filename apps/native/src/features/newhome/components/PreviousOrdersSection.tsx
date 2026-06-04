import { router } from "expo-router";
import { ClipboardList, type LucideIcon, RotateCcw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Button } from "@/src/components/ui/button";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { DUR_SLIDE_UP, ENTRANCE_STAGGER } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import { getCategoryMeta } from "@/src/features/categories/constants/categories";
import { ROUTES } from "@/src/lib/navigation/routes";

function resolveCategoryIcon(categoryId?: string | null): LucideIcon {
	if (!categoryId) return ClipboardList;
	return getCategoryMeta(categoryId)?.icon ?? ClipboardList;
}

function formatCompletionDate(dateStr?: string | null): string {
	if (!dateStr) return "";
	try {
		return new Date(dateStr).toLocaleDateString();
	} catch {
		return "";
	}
}

const SKELETON_KEYS = ["po-sk-1", "po-sk-2", "po-sk-3"];

export function PreviousOrdersSection() {
	const t = useThemeColors();
	const { t: tr } = useTranslation("home");
	const { data: orders, isLoading, isError } = useUserOrdersQuery();

	const completedOrders = (orders ?? [])
		.filter((o) => o.status === "completed")
		.sort((a, b) => {
			const dateA =
				a.user_completed_at ??
				a.technician_completed_at ??
				a.scheduled_date ??
				"";
			const dateB =
				b.user_completed_at ??
				b.technician_completed_at ??
				b.scheduled_date ??
				"";
			return dateB.localeCompare(dateA);
		})
		.slice(0, 3);

	return (
		<View>
			{/* Section header */}
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingHorizontal: 20,
					marginBottom: 12,
				}}
			>
				<Text variant="h3" className="text-foreground">
					{tr("previousOrders")}
				</Text>
			</View>

			{/* Loading state */}
			{isLoading && (
				<View style={{ paddingHorizontal: 20, gap: 8 }}>
					{SKELETON_KEYS.map((key) => (
						<Skeleton key={key} className="rounded-xl" style={{ height: 68 }} />
					))}
				</View>
			)}

			{/* Error state */}
			{isError && !isLoading && (
				<Text variant="bodySm" className="px-5 text-center text-danger">
					{tr("couldNotLoadOrders")}
				</Text>
			)}

			{/* Empty state */}
			{!isLoading && !isError && completedOrders.length === 0 && (
				<View style={{ paddingHorizontal: 20 }}>
					<View
						className="rounded-[14px] border border-border bg-card"
						style={{ padding: 14, gap: 4 }}
					>
						<Text variant="label" className="text-foreground">
							{tr("noPreviousOrders")}
						</Text>
						<Text variant="bodySm" className="text-muted-foreground">
							{tr("bookFirstService")}
						</Text>
					</View>
				</View>
			)}

			{/* Data state */}
			{!isLoading && !isError && completedOrders.length > 0 && (
				<View style={{ paddingHorizontal: 20, gap: 8 }}>
					{completedOrders.map((order, index) => {
						const completionDate =
							order.user_completed_at ??
							order.technician_completed_at ??
							order.scheduled_date ??
							null;
						const IconComponent = resolveCategoryIcon(order.category_id);
						const orderMeta = [
							order.technician_name,
							completionDate ? formatCompletionDate(completionDate) : null,
						]
							.filter(Boolean)
							.join(" · ");
						const price = order.final_price ?? order.estimated_price ?? null;

						return (
							<Animated.View
								key={order.id}
								entering={FadeInUp.delay(index * ENTRANCE_STAGGER).duration(
									DUR_SLIDE_UP,
								)}
							>
								<View
									className="bg-card"
									style={{
										borderRadius: 16,
										borderWidth: 1,
										borderColor: t.borderDefault,
										padding: 11,
										flexDirection: "row",
										alignItems: "center",
										gap: 10,
									}}
								>
									<PressableScale
										pressedScale={0.98}
										onPress={() =>
											router.push(ROUTES.user.orderDetail(order.id))
										}
										style={{
											flex: 1,
											minWidth: 0,
											flexDirection: "row",
											alignItems: "center",
											gap: 11,
										}}
									>
										<View
											style={{
												width: 40,
												height: 40,
												borderRadius: 13,
												backgroundColor: t.tint.chip,
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Icon
												as={IconComponent}
												size={20}
												color={t.tint.onChip}
												strokeWidth={2.2}
											/>
										</View>

										<View style={{ flex: 1, minWidth: 0, gap: 4 }}>
											<Text
												variant="label"
												className="text-foreground"
												numberOfLines={1}
											>
												{order.service_name ?? tr("serviceFallback")}
											</Text>
											<Text
												variant="caption"
												className="text-muted-foreground"
												numberOfLines={1}
											>
												{orderMeta}
											</Text>
										</View>
									</PressableScale>

									<View style={{ alignItems: "flex-end", gap: 7 }}>
										{price != null ? (
											<Text variant="caption" className="text-muted-foreground">
												{formatCurrency(price)}
											</Text>
										) : null}

										<Button
											size="sm"
											variant="secondary"
											iconLeft={RotateCcw}
											onPress={() => {
												const route = ROUTES.user.technicianDetail(
													order.technician_id,
												);
												router.push({
													...route,
													params: {
														...route.params,
														technicianName: order.technician_name ?? undefined,
														categoryId: order.category_id ?? undefined,
														preselectServiceId: order.service_id,
													},
												});
											}}
										>
											{tr("reorder")}
										</Button>
									</View>
								</View>
							</Animated.View>
						);
					})}
				</View>
			)}
		</View>
	);
}
