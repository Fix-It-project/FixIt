import { Ban, CalendarClock, CheckCircle2 } from "lucide-react-native";
import { useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import { Button } from "@/src/components/ui/button";
import {
	OrderInfoCompact,
	RescheduleRequestPanel,
	RescheduleSheet,
	type RescheduleSheetHandle,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import { useUserCancelOrder } from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { space, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function AcceptedView({ order }: Props) {
	const themeColors = useThemeColors();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={CheckCircle2}
				eyebrow="Confirmed"
				title="Technician accepted."
				subtitle="Live ETA arrives the moment they start moving."
				accentColor={themeColors.success}
			/>
			<OrderInfoCompact
				order={order}
				viewer="user"
				onIdentityPress={() =>
					profileSheetRef.current?.open(
						order.technician_id,
						getPfpInitialsFallback(order.technician_name),
					)
				}
			/>
			<RescheduleRequestPanel
				orderId={order.id}
				viewer="user"
				forceVisible={order.has_pending_reschedule === true}
			/>
			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}

export function AcceptedViewCta({ order }: Props) {
	const themeColors = useThemeColors();
	const rescheduleRef = useRef<RescheduleSheetHandle>(null);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const cancel = useUserCancelOrder();
	const hasPendingReschedule = order.has_pending_reschedule === true;

	const handleConfirmCancel = () => {
		const trimmed = cancelReason.trim();
		cancel.mutate(
			{ orderId: order.id, reason: trimmed.length > 0 ? trimmed : undefined },
			{
				onSuccess: () => {
					setCancelOpen(false);
					setCancelReason("");
					Toast.show({ type: "success", text1: "Order cancelled" });
				},
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: "Failed to cancel",
						text2: err.message,
					}),
			},
		);
	};

	return (
		<>
			<View style={{ gap: space[1] }}>
				<View className="flex-row items-center gap-stack-md">
					<View className="flex-1">
						<Button
							variant="primary"
							size="lg"
							fullWidth
							iconLeft={CheckCircle2}
							onPress={() => {}}
							disabled
						>
							Waiting for technician
						</Button>
					</View>
					<View className="shrink-0 flex-row" style={{ gap: space[2] }}>
						<Button
							variant="secondary"
							size="icon"
							accessibilityLabel="Reschedule order"
							onPress={() =>
								rescheduleRef.current?.open({
									orderId: order.id,
									technicianId: order.technician_id,
									originalScheduledDate: order.scheduled_date,
								})
							}
							disabled={cancel.isPending || hasPendingReschedule}
						>
							<CalendarClock size={20} />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							accessibilityLabel="Cancel order"
							onPress={() => setCancelOpen(true)}
							disabled={cancel.isPending}
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
						{"Resolve the pending reschedule request before requesting another."}
					</Text>
				) : null}
			</View>
			<RescheduleSheet ref={rescheduleRef} viewer="user" />
			<CancelReasonModal
				visible={cancelOpen}
				title="Cancel Order"
				subjectRole="order"
				subjectName={order.technician_name}
				subjectFallback="this technician"
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (cancel.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={cancel.isPending}
			/>
		</>
	);
}
