import { Ban, Search } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import {
	InspectionProgress,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import { useUserCancelOrder } from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { translateOrderError } from "@/src/features/booking-orders/utils/translate-order-error";
import { space } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function ArrivedInspectingView(_props: Props) {
	const { t } = useTranslation("orders");
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Search}
				eyebrow={t("detail.stage.arrived.eyebrow")}
				title={t("detail.stage.arrived.title")}
				subtitle={t("detail.stage.arrived.subtitle")}
			/>
			<InspectionProgress />
		</View>
	);
}

// While the tech inspects, the user is waiting for a quote — they still need a
// way out. Surface a cancel action (reusing the shared reason modal).
export function ArrivedInspectingViewCta({ order }: Props) {
	const { t } = useTranslation("orders");
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const userCancel = useUserCancelOrder();

	function handleConfirmCancel() {
		const trimmed = cancelReason.trim();
		userCancel.mutate(
			{
				orderId: order.id,
				reason:
					trimmed.length > 0 ? trimmed : t("detail.quote.cancelReasonDefault"),
			},
			{
				onSuccess: () => {
					setCancelOpen(false);
					setCancelReason("");
				},
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: t("detail.quote.toastCancelFailed"),
						text2: translateOrderError(err),
					}),
			},
		);
	}

	return (
		<>
			<Button
				variant="secondary"
				fullWidth
				iconLeft={Ban}
				onPress={() => setCancelOpen(true)}
				loading={userCancel.isPending}
				accessibilityLabel={t("detail.a11y.cancelOrder")}
			>
				{t("detail.a11y.cancelOrder")}
			</Button>
			<CancelReasonModal
				visible={cancelOpen}
				title={t("detail.cancelModal.title")}
				subjectRole="order"
				subjectName={order.technician_name}
				subjectFallback={t("detail.cancelModal.subjectFallback")}
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (userCancel.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={userCancel.isPending}
			/>
		</>
	);
}
