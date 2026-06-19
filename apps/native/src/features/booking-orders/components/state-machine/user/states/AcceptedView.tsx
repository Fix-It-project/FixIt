import { router } from "expo-router";
import { Ban, CalendarClock, CheckCircle2 } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import { Button } from "@/src/components/ui/button";
import {
	OrderInfoCompact,
	RescheduleRequestPanel,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import { useUserCancelOrder } from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { space, useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation";

interface Props {
	readonly order: Order;
}

export default function AcceptedView({ order }: Props) {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={CheckCircle2}
				eyebrow={t("detail.stage.accepted.eyebrow")}
				title={t("detail.stage.accepted.title")}
				subtitle={t("detail.stage.accepted.subtitle")}
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
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
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
					Toast.show({ type: "success", text1: t("detail.toast.cancelled") });
				},
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: t("detail.toast.cancelFailed"),
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
							{t("detail.cta.waitingForTechnician")}
						</Button>
					</View>
					<View className="shrink-0 flex-row" style={{ gap: space[2] }}>
						<Button
							variant="secondary"
							size="icon"
							accessibilityLabel={t("detail.a11y.rescheduleOrder")}
							onPress={() =>
								router.push(
									ROUTES.user.reschedule(order.id, order.technician_id),
								)
							}
							disabled={cancel.isPending || hasPendingReschedule}
						>
							<CalendarClock size={20} />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							accessibilityLabel={t("detail.a11y.cancelOrder")}
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
						{t("detail.cta.pendingReschedule")}
					</Text>
				) : null}
			</View>
			<CancelReasonModal
				visible={cancelOpen}
				title={t("detail.cancelModal.title")}
				subjectRole="order"
				subjectName={order.technician_name}
				subjectFallback={t("detail.cancelModal.subjectFallback")}
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
