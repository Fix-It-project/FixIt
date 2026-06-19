import { Ban, Clock } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Button } from "@/src/components/ui/button";
import { space } from "@/src/constants/design-tokens";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import { useUserCancelOrder } from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import OrderInfoCompact from "./OrderInfoCompact";
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

			<Button
				variant="destructive"
				size="lg"
				fullWidth
				iconLeft={Ban}
				accessibilityLabel={t("detail.a11y.cancelOrder")}
				onPress={() => setCancelOpen(true)}
				loading={cancelMutation.isPending}
			>
				{t("detail.a11y.cancelOrder")}
			</Button>

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
