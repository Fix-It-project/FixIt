import { router } from "expo-router";
import { Ban, CalendarClock, Clock } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { ROUTES } from "@/src/lib/navigation";
import { space } from "@/src/constants/design-tokens";
import OrderInfoCompact from "./OrderInfoCompact";
import RescheduleRequestPanel from "./RescheduleRequestPanel";
import StageHero from "./StageHero";

interface Props {
	readonly order: Order;
}

export default function PendingWaitingCard({ order }: Props) {
	const { t } = useTranslation("orders");
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	const cancelMutation = useUserCancelOrder();
	const { data: rescheduleRequest } = useOrderRescheduleQuery(order.id, "user");
	const hasPendingReschedule = rescheduleRequest?.resolution === "pending";

	const openReschedule = useCallback(() => {
		router.push(ROUTES.user.reschedule(order.id, order.technician_id));
	}, [order.id, order.technician_id]);

	const handleConfirmCancel = useCallback(() => {
		const trimmed = cancelReason.trim();
		cancelMutation.mutate(
			{ orderId: order.id, reason: trimmed.length > 0 ? trimmed : undefined },
			{
				onSuccess: () => {
					setCancelOpen(false);
					setCancelReason("");
					Toast.show({ type: "success", text1: t("detail.toast.cancelled") });
				},
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: t("detail.toast.cancelFailed"),
						text2: err instanceof Error ? err.message : undefined,
					}),
			},
		);
	}, [cancelMutation, cancelReason, order.id, t]);

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Clock}
				eyebrow={t("detail.stage.pending.eyebrow")}
				title={t("detail.stage.pending.title")}
				subtitle={t("detail.stage.pending.subtitle")}
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
						{hasPendingReschedule
							? t("detail.cta.requestPending")
							: t("detail.cta.reschedule")}
					</Button>
				</View>
				<View className="shrink-0">
					<Button
						variant="destructive"
						size="icon"
						accessibilityLabel={t("detail.a11y.cancelOrder")}
						onPress={() => setCancelOpen(true)}
						loading={cancelMutation.isPending}
					>
						<Ban size={20} />
					</Button>
				</View>
			</View>

			<TechnicianProfileSheet ref={profileSheetRef} />

			<CancelReasonModal
				visible={cancelOpen}
				title={t("detail.cancelModal.title")}
				subjectRole="order"
				subjectName={order.technician_name}
				subjectFallback={t("detail.cancelModal.subjectFallback")}
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
