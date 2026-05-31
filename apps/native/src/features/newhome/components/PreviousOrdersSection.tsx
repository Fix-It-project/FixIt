import { router } from "expo-router";
import { ClipboardList, type LucideIcon, RotateCcw } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { DUR_SLIDE_UP, ENTRANCE_STAGGER } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import { getCategoryMeta } from "@/src/features/categories/constants/categories";
import { ROUTES } from "@/src/lib/navigation/routes";

function colorWithAlpha(color: string, alpha: number): string {
	const normalized = color.replace("#", "");
	if (normalized.length !== 6) return color;

	const red = Number.parseInt(normalized.slice(0, 2), 16);
	const green = Number.parseInt(normalized.slice(2, 4), 16);
	const blue = Number.parseInt(normalized.slice(4, 6), 16);

	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function resolveCategoryIcon(categoryId?: string | null): LucideIcon {
	if (!categoryId) return ClipboardList;
	return getCategoryMeta(categoryId)?.icon ?? ClipboardList;
}

function resolveCategoryColor(
	categoryId: string | null | undefined,
	fallback: string,
): string {
	if (!categoryId) return fallback;
	return getCategoryMeta(categoryId)?.color ?? fallback;
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
						const categoryColor = resolveCategoryColor(
							order.category_id,
							t.tint.onChip,
						);
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
										borderColor: colorWithAlpha(t.borderDefault, 0.8),
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
												backgroundColor: colorWithAlpha(categoryColor, 0.13),
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<IconComponent
												size={20}
												color={categoryColor}
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

										<PressableScale
											pressedScale={0.92}
											onPress={() =>
												router.push(
													ROUTES.user.bookingRoot(order.technician_id),
												)
											}
										>
											<View
												style={{
													backgroundColor: t.tint.surfaceSoft,
													borderRadius: 999,
													paddingHorizontal: 10,
													paddingVertical: 7,
													flexDirection: "row",
													alignItems: "center",
													gap: 5,
												}}
											>
												<RotateCcw
													size={13}
													color={t.tint.onSoft}
													strokeWidth={2.2}
												/>
												<Text
													variant="buttonMd"
													style={{ color: t.tint.onSoft }}
												>
													{tr("reorder")}
												</Text>
											</View>
										</PressableScale>
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
