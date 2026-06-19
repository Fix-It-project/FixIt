import type { AxiosError } from "axios";
import { router } from "expo-router";
import { Ban, CalendarClock, Truck } from "lucide-react-native";
import { useMemo, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { space, useThemeColors } from "@/src/constants/design-tokens";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import {
	RescheduleRequestPanel,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import {
	useTechCancel,
	useTechnicianBookingsQuery,
	useTechStartTracking,
} from "@/src/features/booking-orders/hooks";
import { IN_PROGRESS_STATUSES } from "@/src/features/booking-orders/schemas/order-status.schema";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import {
	extractOrderErrorToken,
	translateOrderError,
} from "@/src/features/booking-orders/utils/translate-order-error";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

interface Props {
	readonly order: Order;
}

export default function AcceptedBody({ order }: Props) {
	const themeColors = useThemeColors();

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Truck}
				eyebrow="Accepted"
				title="Job locked in."
				subtitle="Hit the road when ready. Live ETA syncs to the customer."
				accentColor={themeColors.success}
			/>
			<RescheduleRequestPanel
				orderId={order.id}
				viewer="technician"
				forceVisible={order.has_pending_reschedule === true}
			/>
		</View>
	);
}

export function AcceptedCta({ order }: Props) {
	const themeColors = useThemeColors();
	const authUserId = useAuthStore((s) => s.user?.id ?? null);
	const booking = order as unknown as TechnicianBooking;
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	const startTracking = useTechStartTracking();
	const cancelMutation = useTechCancel();
	const { data: bookings = [] } = useTechnicianBookingsQuery();
	const hasPendingReschedule = order.has_pending_reschedule === true;

	const otherActiveOrder = useMemo(
		() =>
			bookings.find(
				(b) => IN_PROGRESS_STATUSES.has(b.status) && b.id !== order.id,
			),
		[bookings, order.id],
	);
	const blocked = Boolean(otherActiveOrder) || hasPendingReschedule;

	const handleStart = () => {
		if (blocked) return;
		startTracking.mutate(
			{ orderId: order.id },
			{
				onError: (err) => {
					const axiosErr = err as AxiosError<{ error?: string }>;
					logger.warn("lifecycle-error", "start tracking failed", {
						orderId: order.id,
						status: axiosErr?.response?.status,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: "Couldn't start tracking",
						text2: translateOrderError(err),
					});
				},
			},
		);
	};

	const handleConfirmCancel = () => {
		const trimmed = cancelReason.trim();
		cancelMutation.mutate(
			{ orderId: order.id, reason: trimmed.length > 0 ? trimmed : undefined },
			{
				onSuccess: () => {
					setCancelOpen(false);
					setCancelReason("");
					Toast.show({ type: "success", text1: "Booking cancelled" });
				},
				onError: (err) => {
					logger.warn("booking.lifecycle", "accepted_cancel_failed", {
						orderId: order.id,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: "Could not cancel",
						text2: translateOrderError(err),
					});
				},
			},
		);
	};

	return (
		<>
			<View style={{ gap: space[1] }}>
				<View className="flex-row items-center gap-stack-md">
					<View className="flex-1" style={{ opacity: blocked ? 0.45 : 1 }}>
						<Button
							variant="primary"
							size="lg"
							fullWidth
							iconLeft={Truck}
							onPress={handleStart}
							loading={startTracking.isPending}
							disabled={blocked}
						>
							Start tracking
						</Button>
					</View>
					<View className="shrink-0 flex-row" style={{ gap: space[2] }}>
						<Button
							variant="secondary"
							size="icon"
							accessibilityLabel="Reschedule job"
							onPress={() =>
								router.push(
									ROUTES.technician.reschedule(
										order.id,
										order.technician_id ?? authUserId,
									),
								)
							}
							disabled={startTracking.isPending || hasPendingReschedule}
						>
							<CalendarClock size={20} />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							accessibilityLabel="Cancel job"
							onPress={() => setCancelOpen(true)}
							disabled={startTracking.isPending}
						>
							<Ban size={20} />
						</Button>
					</View>
				</View>
				{hasPendingReschedule ? (
					<Text
						variant="caption"
						style={{
							color: themeColors.textMuted,
							textAlign: "center",
						}}
					>
						{"Resolve the pending reschedule request before starting tracking."}
					</Text>
				) : blocked ? (
					<Text
						variant="caption"
						style={{
							color: themeColors.textMuted,
							textAlign: "center",
						}}
					>
						{
							"Start tracking is unavailable because another order is already being tracked. "
						}
						{"Finish that order first."}
					</Text>
				) : null}
			</View>
			<CancelReasonModal
				visible={cancelOpen}
				title="Cancel Booking"
				subjectRole="booking"
				subjectName={booking.user_name}
				subjectFallback="this client"
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (cancelMutation.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={cancelMutation.isPending}
				confirmLabel="Cancel Booking"
			/>
		</>
	);
}
