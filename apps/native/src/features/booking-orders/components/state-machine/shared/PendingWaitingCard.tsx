import { Ban, CalendarClock, Clock } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Button } from "@/src/components/ui/button";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import {
	useOrderRescheduleQuery,
	useUserCancelOrder,
} from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { space } from "@/src/constants/design-tokens";
import OrderInfoCompact from "./OrderInfoCompact";
import RescheduleRequestPanel from "./RescheduleRequestPanel";
import RescheduleSheet, { type RescheduleSheetHandle } from "./RescheduleSheet";
import StageHero from "./StageHero";

interface Props {
	readonly order: Order;
}

export default function PendingWaitingCard({ order }: Props) {
	const rescheduleRef = useRef<RescheduleSheetHandle>(null);
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	const cancelMutation = useUserCancelOrder();
	const { data: rescheduleRequest } = useOrderRescheduleQuery(order.id, "user");
	const hasPendingReschedule = rescheduleRequest?.resolution === "pending";

	const openReschedule = useCallback(() => {
		rescheduleRef.current?.open({
			orderId: order.id,
			technicianId: order.technician_id,
			originalScheduledDate: order.scheduled_date,
		});
	}, [order.id, order.scheduled_date, order.technician_id]);

	const handleConfirmCancel = useCallback(() => {
		const trimmed = cancelReason.trim();
		cancelMutation.mutate(
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
						text2: err instanceof Error ? err.message : undefined,
					}),
			},
		);
	}, [cancelMutation, cancelReason, order.id]);

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Clock}
				eyebrow="Request sent"
				title="Waiting on the tech."
				subtitle="Usually under 30 min. You'll get a ping the moment they accept."
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

			<View className="flex-row items-center gap-stack-md">
				<View className="flex-1">
					<Button
						variant="primary"
						size="lg"
						fullWidth
						iconLeft={CalendarClock}
						onPress={openReschedule}
						disabled={hasPendingReschedule}
					>
						{hasPendingReschedule ? "Request pending" : "Reschedule"}
					</Button>
				</View>
				<View className="shrink-0">
					<Button
						variant="destructive"
						size="icon"
						accessibilityLabel="Cancel order"
						onPress={() => setCancelOpen(true)}
						loading={cancelMutation.isPending}
					>
						<Ban size={20} />
					</Button>
				</View>
			</View>

			<RescheduleSheet ref={rescheduleRef} />
			<TechnicianProfileSheet ref={profileSheetRef} />

			<CancelReasonModal
				visible={cancelOpen}
				title="Cancel Order"
				subjectRole="order"
				subjectName={order.technician_name}
				subjectFallback="this technician"
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (cancelMutation.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={cancelMutation.isPending}
			/>
		</View>
	);
}
