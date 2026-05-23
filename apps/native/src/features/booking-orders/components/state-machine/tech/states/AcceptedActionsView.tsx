import type { AxiosError } from "axios";
import { Ban, CalendarClock, Truck } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import {
	CustomerInfoSheet,
	type CustomerInfoSheetHandle,
	IconActionButton,
	OrderInfoCompact,
	RescheduleRequestPanel,
	RescheduleSheet,
	type RescheduleSheetHandle,
	StageActionRow,
	StageHero,
	StagePrimaryAction,
} from "@/src/features/booking-orders/components/state-machine/shared";
import { BookingCancelModal } from "@/src/features/booking-orders/components/tech";
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
import { translateOrderError } from "@/src/features/booking-orders/utils/translate-order-error";
import { useAuthStore } from "@/src/stores/auth-store";
import { space, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function AcceptedBody({ order }: Props) {
	const themeColors = useThemeColors();
	const booking = order as unknown as TechnicianBooking;
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Truck}
				eyebrow="Accepted"
				title="Job locked in."
				subtitle="Hit the road when ready. Live ETA syncs to the customer."
				accentColor={themeColors.success}
			/>
			<OrderInfoCompact
				order={order}
				viewer="technician"
				onIdentityPress={() =>
					customerSheetRef.current?.open({
						name: booking.user_name ?? "Customer",
						phone: booking.user_phone ?? null,
						address: booking.user_address ?? null,
						problem: order.problem_description ?? null,
					})
				}
			/>
			<RescheduleRequestPanel
				orderId={order.id}
				viewer="technician"
				forceVisible={order.has_pending_reschedule === true}
			/>
			<CustomerInfoSheet ref={customerSheetRef} />
		</View>
	);
}

export function AcceptedCta({ order }: Props) {
	const themeColors = useThemeColors();
	const authUserId = useAuthStore((s) => s.user?.id ?? null);
	const booking = order as unknown as TechnicianBooking;
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const rescheduleRef = useRef<RescheduleSheetHandle>(null);

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
					console.warn(
						"[lifecycle-error]",
						axiosErr?.response?.status,
						axiosErr?.response?.data,
					);
					Toast.show({
						type: "error",
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
				onError: (err) =>
					Toast.show({
						type: "error",
						text1: "Could not cancel",
						text2: translateOrderError(err),
					}),
			},
		);
	};

	return (
		<>
			<View style={{ gap: space[1] }}>
				<StageActionRow
					primary={
						<View style={{ opacity: blocked ? 0.45 : 1 }}>
							<StagePrimaryAction
								label="Start tracking"
								icon={Truck}
								onPress={handleStart}
								pending={startTracking.isPending}
								disabled={blocked}
							/>
						</View>
					}
					trailing={
						<View style={{ flexDirection: "row", gap: space[2] }}>
							<IconActionButton
								icon={CalendarClock}
								accessibilityLabel="Reschedule job"
								onPress={() =>
									rescheduleRef.current?.open({
										orderId: order.id,
										technicianId: order.technician_id ?? authUserId,
										originalScheduledDate: order.scheduled_date,
									})
								}
								disabled={startTracking.isPending || hasPendingReschedule}
							/>
							<IconActionButton
								icon={Ban}
								tone="danger"
								accessibilityLabel="Cancel job"
								onPress={() => setCancelOpen(true)}
								disabled={startTracking.isPending}
							/>
						</View>
					}
				/>
				{hasPendingReschedule ? (
					<Text
						variant="caption"
						style={{
							color: themeColors.textMuted,
							fontSize: 11,
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
							fontSize: 11,
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
			<RescheduleSheet ref={rescheduleRef} viewer="technician" />
			<BookingCancelModal
				visible={cancelOpen}
				clientName={booking.user_name}
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (cancelMutation.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={cancelMutation.isPending}
			/>
		</>
	);
}
