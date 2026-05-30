import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Text } from "@/src/components/ui/text";
import {
	DUR_PULSE_IN,
	DUR_PULSE_OUT,
	DUR_REVEAL,
	EASE_OUT_EXPO,
	PULSE_SCALE_MAX,
} from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useUserActiveOrder } from "@/src/features/booking-orders/hooks/useUserActiveOrder";
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
function getFilledSteps(status: OrderStatus): number {
	switch (status) {
		case "pending":
			return 1;
		case "accepted":
			return 2;
		case "tracking":
			return 2;
		case "in_progress":
			return 3;
		case "arrived_inspection":
			return 4;
		case "awaiting_final_cost":
			return 4;
		case "negotiating":
			return 4;
		case "awaiting_payment":
			return 4;
		case "completed":
			return 4;
		default:
			return 1;
	}
}

// ── Progress dot pulse ─────────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
	const reducedMotion = useReducedMotion();
	const scale = useSharedValue(1);

	useEffect(() => {
		if (!reducedMotion) {
			scale.value = withRepeat(
				withSequence(
					withTiming(PULSE_SCALE_MAX, { duration: DUR_PULSE_IN }),
					withTiming(1, { duration: DUR_PULSE_OUT }),
				),
				-1,
				false,
			);
		}
	}, [reducedMotion, scale]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View
			style={[
				animatedStyle,
				{
					width: 8,
					height: 8,
					borderRadius: 4,
					backgroundColor: color,
				},
			]}
		/>
	);
}

// ── Main component ─────────────────────────────────────────────────────────────
const STEP_LABELS = ["Booked", "Assigned", "En route", "Arrived"] as const;

export function ActiveOrderStrip() {
	const t = useThemeColors();
	const router = useRouter();
	const { activeOrder, isLoading } = useUserActiveOrder();

	// Hidden while loading or when no active order
	if (isLoading || !activeOrder) {
		return null;
	}

	const pillColors = getPillColors(activeOrder.status, t);
	const statusLabel = getOrderStatusLabel(activeOrder.status, "user");
	const filledSteps = getFilledSteps(activeOrder.status);
	const progressWidth = `${(filledSteps / 4) * 100}%` as const;

	// Format the scheduled time
	const rawTime = activeOrder.scheduled_start_at ?? activeOrder.scheduled_date;
	const formattedTime = rawTime
		? new Date(rawTime).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";

	const orderRef = `#${activeOrder.id.slice(0, 8)}`;

	return (
		<Animated.View
			entering={FadeInDown.delay(80).duration(DUR_REVEAL).easing(EASE_OUT_EXPO)}
			className="px-5"
		>
			<View className="overflow-hidden rounded-[14px] border border-border bg-card">
				{/* Row 1 — status pill + order ref */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingHorizontal: 14,
						paddingVertical: 10,
					}}
				>
					<View
						style={{
							backgroundColor: pillColors.bg,
							borderRadius: 8,
							paddingHorizontal: 10,
							paddingVertical: 4,
						}}
					>
						<Text variant="caption" style={{ color: pillColors.text }}>
							{statusLabel}
						</Text>
					</View>
					<Text variant="caption" className="text-muted-foreground">
						{orderRef}
					</Text>
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
					{/* Avatar with pulse dot */}
					<View style={{ position: "relative" }}>
						<InitialsAvatar
							name={activeOrder.technician_name ?? "T"}
							imageUrl={activeOrder.technician_image}
							className="size-10"
						/>
						<View
							style={{
								position: "absolute",
								bottom: 0,
								right: 0,
							}}
						>
							<PulseDot color={t.statusOnline} />
						</View>
					</View>

					{/* Tech name + status descriptor */}
					<View style={{ flex: 1 }}>
						<Text variant="label" className="text-foreground" numberOfLines={1}>
							{activeOrder.technician_name ?? "Technician"}
						</Text>
						<Text
							variant="caption"
							className="text-muted-foreground"
							numberOfLines={1}
						>
							{activeOrder.status === "tracking" ? "On the way" : "Scheduled"}
						</Text>
					</View>

					{/* Scheduled time column */}
					<View style={{ alignItems: "flex-end" }}>
						<Text
							variant="caption"
							style={{ fontWeight: "600" }}
							className="text-muted-foreground"
						>
							Scheduled
						</Text>
						<Text variant="h3" className="text-foreground">
							{formattedTime}
						</Text>
					</View>
				</View>

				{/* Row 3 — progress bar + step labels */}
				<View style={{ paddingHorizontal: 14, paddingBottom: 8 }}>
					{/* Progress track */}
					<View
						style={{
							height: 4,
							backgroundColor: t.tint.surfaceFaint,
							borderRadius: 2,
							overflow: "hidden",
						}}
					>
						<View
							style={{
								height: 4,
								backgroundColor: t.primary,
								width: progressWidth,
							}}
						/>
					</View>

					{/* Step labels */}
					<View
						style={{
							flexDirection: "row",
							justifyContent: "space-between",
							marginTop: 6,
						}}
					>
						{STEP_LABELS.map((label, index) => (
							<Text
								key={label}
								variant="caption"
								style={{
									color: index < filledSteps ? t.primary : undefined,
								}}
								className={
									index < filledSteps ? undefined : "text-muted-foreground"
								}
							>
								{label}
							</Text>
						))}
					</View>
				</View>

				{/* Row 4 — View order CTA */}
				<View
					style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 }}
				>
					<PressableScale
						pressedScale={0.96}
						onPress={() => router.push(ROUTES.user.orderDetail(activeOrder.id))}
					>
						<View className="items-center rounded-[10px] bg-primary py-3">
							<Text variant="buttonMd" className="text-primary-foreground">
								View order
							</Text>
						</View>
					</PressableScale>
				</View>
			</View>
		</Animated.View>
	);
}
