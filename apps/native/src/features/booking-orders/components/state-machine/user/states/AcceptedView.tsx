import { Ban, CalendarClock, CheckCircle2 } from "lucide-react-native";
import { useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import OrderCancelModal from "@/src/features/booking-orders/components/user/OrderCancelModal";
import {
	IconActionButton,
	OrderInfoCompact,
	RescheduleRequestPanel,
	RescheduleSheet,
	type RescheduleSheetHandle,
	StageActionRow,
	StageHero,
	StagePrimaryAction,
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
						type: "error",
						text1: "Failed to cancel",
						text2: err.message,
					}),
			},
		);
	};

	return (
		<>
			<View style={{ gap: space[1] }}>
				<StageActionRow
					primary={
						<StagePrimaryAction
							label="Waiting for technician"
							icon={CheckCircle2}
							onPress={() => {}}
							disabled
						/>
					}
					trailing={
						<View style={{ flexDirection: "row", gap: space[2] }}>
							<IconActionButton
								icon={CalendarClock}
								accessibilityLabel="Reschedule order"
								onPress={() => rescheduleRef.current?.open(order.id)}
								disabled={cancel.isPending || hasPendingReschedule}
							/>
							<IconActionButton
								icon={Ban}
								tone="danger"
								accessibilityLabel="Cancel order"
								onPress={() => setCancelOpen(true)}
								disabled={cancel.isPending}
							/>
						</View>
					}
				/>
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
			<OrderCancelModal
				visible={cancelOpen}
				technicianName={order.technician_name}
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
