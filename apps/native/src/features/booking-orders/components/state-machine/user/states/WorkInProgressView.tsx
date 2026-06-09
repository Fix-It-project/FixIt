import { Ban, CheckCircle2, Hammer } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import CompletionRequestPendingCard from "@/src/features/booking-orders/components/state-machine/shared/CompletionRequestPendingCard";
import { Button } from "@/src/components/ui/button";
import {
	OrderInfoCompact,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import {
	useUserCancelOrder,
	useUserConfirmCompletion,
	useUserDeclineCompletion,
} from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { space } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function WorkInProgressView({ order }: Props) {
	const { t } = useTranslation("orders");
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const userCompletedAt = order.user_completed_at ?? null;
	const techCompletedAt = order.technician_completed_at ?? null;
	const userRequested = userCompletedAt !== null && techCompletedAt === null;
	const techRequested = techCompletedAt !== null && userCompletedAt === null;
	const decline = useUserDeclineCompletion();
	const confirm = useUserConfirmCompletion();

	const fire = (mutation: typeof confirm, failMessage: string) => {
		mutation.mutate(
			{ orderId: order.id },
			{
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: failMessage,
						text2: err.message,
					}),
			},
		);
	};

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Hammer}
				eyebrow={t("detail.stage.inProgress.eyebrow")}
				title={t("detail.stage.inProgress.title")}
				subtitle={t("detail.stage.inProgress.subtitle")}
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
			{userRequested ? (
				<CompletionRequestPendingCard
					direction="awaiting_them"
					actorLabel={t("card.technicianFallback")}
					requestedAt={userCompletedAt}
					onDecline={() => fire(decline, t("detail.toast.couldNotDecline"))}
					declinePending={decline.isPending}
				/>
			) : null}
			{techRequested ? (
				<CompletionRequestPendingCard
					direction="awaiting_me"
					actorLabel={t("card.technicianFallback")}
					requestedAt={techCompletedAt}
					onConfirm={() => fire(confirm, t("detail.toast.couldNotConfirm"))}
					onDecline={() => fire(decline, t("detail.toast.couldNotDecline"))}
					confirmPending={confirm.isPending}
					declinePending={decline.isPending}
				/>
			) : null}
			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}

export function WorkInProgressViewCta({ order }: Props) {
	const { t } = useTranslation("orders");
	const userCompletedAt = order.user_completed_at ?? null;
	const techCompletedAt = order.technician_completed_at ?? null;
	const noPending = !userCompletedAt && !techCompletedAt;
	const confirm = useUserConfirmCompletion();
	const cancel = useUserCancelOrder();

	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	if (!noPending) return null;

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
			<View className="flex-row items-center gap-stack-md">
				<View className="flex-1">
					<Button
						variant="primary"
						size="lg"
						fullWidth
						iconLeft={CheckCircle2}
						onPress={() =>
							confirm.mutate(
								{ orderId: order.id },
								{
									onError: (err) =>
										Toast.show({
											type: "info",
											text1: t("detail.toast.couldNotConfirm"),
											text2: err.message,
										}),
								},
							)
						}
						loading={confirm.isPending}
					>
						{t("detail.cta.markWorkComplete")}
					</Button>
				</View>
				<View className="shrink-0">
					<Button
						variant="destructive"
						size="icon"
						accessibilityLabel={t("detail.a11y.cancelOrder")}
						onPress={() => setCancelOpen(true)}
						loading={cancel.isPending}
					>
						<Ban size={20} />
					</Button>
				</View>
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
