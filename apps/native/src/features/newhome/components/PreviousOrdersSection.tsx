import { router } from "expo-router";
import {
	CalendarDays,
	ClipboardList,
	type LucideIcon,
	Plus,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { DUR_SLIDE_UP } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useUserOrdersQuery } from "@/src/features/booking-orders/hooks/useUserOrders";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { getDateLocale } from "@/src/features/booking-orders/utils/booking-helpers";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
import {
	getCategoryMeta,
	translateServiceName,
} from "@/src/features/categories/constants/categories";
import { ROUTES } from "@/src/lib/navigation/routes";

function resolveCategoryIcon(categoryId?: string | null): LucideIcon {
	if (!categoryId) return ClipboardList;
	return getCategoryMeta(categoryId)?.icon ?? ClipboardList;
}

function formatCompletionDate(
	dateStr?: string | null,
	language?: string,
): string {
	if (!dateStr) return "";
	try {
		return new Date(dateStr).toLocaleDateString(getDateLocale(language));
	} catch {
		return "";
	}
}

type PaidCompletedOrder = Order & {
	final_price: number;
	payment_method: NonNullable<Order["payment_method"]>;
	user_completed_at: string;
	technician_completed_at: string;
};

function isFinishedAndPaidOrder(order: Order): order is PaidCompletedOrder {
	return (
		order.status === "completed" &&
		order.final_price != null &&
		order.payment_method != null &&
		order.user_completed_at != null &&
		order.technician_completed_at != null
	);
}

export function PreviousOrdersSection() {
	const { t: tr } = useTranslation("home");
	const { data: orders, isLoading, isError } = useUserOrdersQuery();

	const latestOrder = (orders ?? [])
		.filter(isFinishedAndPaidOrder)
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
		.at(0);

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
					{tr("latestBooking")}
				</Text>
				<PressableScale onPress={() => router.push(ROUTES.user.activity)}>
					<Text variant="buttonMd" className="text-app-primary">
						{tr("viewAll")}
					</Text>
				</PressableScale>
			</View>

			{/* Loading state */}
			{isLoading && (
				<View style={{ paddingHorizontal: 20 }}>
					<Skeleton className="rounded-card" style={{ height: 148 }} />
				</View>
			)}

			{/* Error state */}
			{isError && !isLoading && (
				<Text variant="bodySm" className="px-5 text-center text-danger">
					{tr("couldNotLoadOrders")}
				</Text>
			)}

			{/* Empty state */}
			{!isLoading && !isError && !latestOrder && (
				<View style={{ paddingHorizontal: 20 }}>
					<Card className="p-card-roomy" style={{ gap: 4 }}>
						<Text variant="label" className="text-foreground">
							{tr("noPreviousOrders")}
						</Text>
						<Text variant="bodySm" className="text-muted-foreground">
							{tr("bookFirstService")}
						</Text>
					</Card>
				</View>
			)}

			{/* Data state */}
			{!isLoading && !isError && latestOrder ? (
				<View style={{ paddingHorizontal: 20 }}>
					<LatestOrderCard order={latestOrder} />
				</View>
			) : null}
		</View>
	);
}

function LatestOrderCard({ order }: { readonly order: PaidCompletedOrder }) {
	const t = useThemeColors();
	const { t: tr, i18n } = useTranslation("home");
	const { t: tc } = useTranslation("categories");
	const completionDate =
		order.user_completed_at ??
		order.technician_completed_at ??
		order.scheduled_date ??
		null;
	const IconComponent = resolveCategoryIcon(order.category_id);
	const completedOn = completionDate
		? formatCompletionDate(completionDate, i18n.language)
		: null;
	const serviceName = translateServiceName(
		tc,
		order.service_id,
		order.service_name,
	);

	return (
		<Animated.View key={order.id} entering={FadeInUp.duration(DUR_SLIDE_UP)}>
			<Card className="p-card-roomy" style={{ gap: 14 }}>
				<PressableScale
					pressedScale={0.98}
					onPress={() => router.push(ROUTES.user.orderDetail(order.id))}
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: 12,
					}}
				>
					<View
						style={{
							width: 52,
							height: 52,
							borderRadius: 12,
							backgroundColor: t.tint.chip,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Icon
							as={IconComponent}
							size={24}
							color={t.tint.onChip}
							strokeWidth={2.2}
						/>
					</View>

					<View style={{ flex: 1, minWidth: 0, gap: 5 }}>
						<Text
							variant="label"
							className="font-bold text-foreground"
							numberOfLines={1}
						>
							{serviceName || tr("serviceFallback")}
						</Text>
						<Text
							variant="caption"
							className="text-muted-foreground"
							numberOfLines={1}
						>
							{order.technician_name ?? tr("technicianFallback")}
						</Text>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 6,
							}}
						>
							<Icon
								as={CalendarDays}
								size={13}
								color={t.textSecondary}
								strokeWidth={2}
							/>
							<Text
								variant="caption"
								className="text-content-muted"
								numberOfLines={1}
							>
								{completedOn}
							</Text>
						</View>
					</View>

					<Text variant="label" className="text-foreground" numberOfLines={1}>
						{formatCurrency(order.final_price)}
					</Text>
				</PressableScale>

				<Button
					size="sm"
					variant="primary"
					fullWidth
					iconLeft={Plus}
					onPress={() => {
						const route = ROUTES.user.technicianDetail(order.technician_id);
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
					{tr("bookAgainCta")}
				</Button>
			</Card>
		</Animated.View>
	);
}
