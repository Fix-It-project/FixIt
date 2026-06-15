import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Text } from "@/src/components/ui/text";
import { DUR_REVEAL, EASE_OUT_EXPO } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useUserActiveOrder } from "@/src/features/booking-orders/hooks/useUserActiveOrder";
import { formatTime } from "@/src/features/booking-orders/utils/booking-helpers";
import type { OrderStatus } from "@/src/features/booking-orders/utils/order-status-ui";
import { getOrderStatusLabel } from "@/src/features/booking-orders/utils/order-status-ui";
import { InitialsAvatar } from "@/src/features/newhome/components/InitialsAvatar";
import { ROUTES } from "@/src/lib/navigation/routes";

// ── Status pill color mapping (calm home-strip — NOT getOrderStatusBadge) ──────
function getPillColors(
	status: OrderStatus,
	t: ReturnType<typeof useThemeColors>,
): { bg: string; text: string } {
	if (
		status === "pending" ||
		status === "reschedule_requested_by_user" ||
		status === "reschedule_requested_by_technician"
	) {
		return { bg: t.warningLight, text: t.warning };
	}
	if (status === "accepted") {
		return { bg: t.orderBg, text: t.success };
	}
	// All other active/tracking statuses
	return { bg: t.orderBg, text: t.orderText };
}

// ── Progress step mapping ──────────────────────────────────────────────────────
// Five user-facing states: on-the-way → inspection → negotiation → fixing →
// awaiting-payment. `accepted` (and reschedule/legacy) sit at 0 = confirmed but not
// yet en route. `pending` never reaches here (excluded by active-order derivation).
const TOTAL_STEPS = 5;

function getFilledSteps(status: OrderStatus): number {
	switch (status) {
		case "tracking":
			return 1; // on the way
		case "arrived_inspection":
			return 2; // inspection
		case "awaiting_final_cost":
		case "negotiating":
			return 3; // negotiation
		case "in_progress":
			return 4; // fixing
		case "awaiting_payment":
			return 5; // awaiting payment
		case "completed":
			return 5;
		case "accepted":
		case "reschedule_requested_by_user":
		case "reschedule_requested_by_technician":
			return 0; // confirmed, not yet en route
		default:
			return 0;
	}
}

// ── Main component ─────────────────────────────────────────────────────────────
const STEP_KEYS = [
	"steps.onTheWay",
	"steps.inspection",
	"steps.negotiation",
	"steps.fixing",
	"steps.awaitingPayment",
] as const;

export function ActiveOrderStrip() {
	const t = useThemeColors();
	const { t: tr, i18n } = useTranslation("home");
	const router = useRouter();
	const { bubbleOrder, isLoading } = useUserActiveOrder();

	// Hidden until the technician has started tracking, matching the floating bubble.
	if (isLoading || !bubbleOrder) {
		return null;
	}

	const pillColors = getPillColors(bubbleOrder.status, t);
	const statusLabel = getOrderStatusLabel(bubbleOrder.status, "user");
	const filledSteps = getFilledSteps(bubbleOrder.status);
	const progressValue = (filledSteps / TOTAL_STEPS) * 100;
	const stepIndex = (Math.min(TOTAL_STEPS, Math.max(1, filledSteps)) - 1) as
		| 0
		| 1
		| 2
		| 3
		| 4;
	const stepKey = STEP_KEYS[stepIndex];
	const currentStepLabel = tr(stepKey);

	// Format the scheduled time
	const rawTime = bubbleOrder.scheduled_start_at ?? bubbleOrder.scheduled_date;
	const formattedTime = rawTime ? formatTime(rawTime, i18n.language) : "—";

	return (
		<Animated.View
			entering={FadeInDown.delay(80).duration(DUR_REVEAL).easing(EASE_OUT_EXPO)}
			className="px-5"
		>
			<View className="overflow-hidden rounded-[14px] bg-card">
				{/* Row 1 — status pill */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "flex-start",
						paddingHorizontal: 14,
						paddingVertical: 10,
					}}
				>
					<Badge
						variant="secondary"
						style={{
							backgroundColor: pillColors.bg,
							borderRadius: 8,
							borderColor: "transparent",
							paddingHorizontal: 10,
							paddingVertical: 4,
						}}
					>
						<Text variant="caption" style={{ color: pillColors.text }}>
							{statusLabel}
						</Text>
					</Badge>
				</View>

				{/* Row 2 — tech avatar + name + scheduled time */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						paddingHorizontal: 14,
						paddingVertical: 12,
						gap: 10,
					}}
				>
					<InitialsAvatar
						name={bubbleOrder.technician_name ?? "T"}
						imageUrl={bubbleOrder.technician_image}
						className="size-10"
					/>

					{/* Tech name + status descriptor */}
					<View style={{ flex: 1 }}>
						<Text variant="label" className="text-foreground" numberOfLines={1}>
							{bubbleOrder.technician_name ?? tr("technicianFallback")}
						</Text>
						<Text
							variant="caption"
							className="text-muted-foreground"
							numberOfLines={1}
						>
							{bubbleOrder.status === "tracking"
								? tr("onTheWay")
								: tr("scheduled")}
						</Text>
					</View>

					{/* Scheduled time column */}
					<View style={{ alignItems: "flex-end" }}>
						<Text
							variant="caption"
							style={{ fontWeight: "600" }}
							className="text-muted-foreground"
						>
							{tr("scheduled")}
						</Text>
						<Text variant="h3" className="text-foreground">
							{formattedTime}
						</Text>
					</View>
				</View>

				{/* Row 3 — progress bar + current step */}
				<View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
					<Progress value={progressValue} className="h-1.5" />

					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							marginTop: 8,
						}}
					>
						<Text
							variant="caption"
							style={{ color: t.primary, fontWeight: "600" }}
							numberOfLines={1}
						>
							{currentStepLabel}
						</Text>
						<Text variant="caption" className="text-muted-foreground">
							{`${filledSteps}/${TOTAL_STEPS}`}
						</Text>
					</View>
				</View>

				{/* Row 4 — View order CTA */}
				<View
					style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 }}
				>
					<Button
						size="md"
						variant="primary"
						fullWidth
						onPress={() => router.push(ROUTES.user.orderDetail(bubbleOrder.id))}
					>
						{tr("viewOrder")}
					</Button>
				</View>
			</View>
		</Animated.View>
	);
}
