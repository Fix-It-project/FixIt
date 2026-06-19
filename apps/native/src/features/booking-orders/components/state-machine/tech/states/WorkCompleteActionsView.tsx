import { Ban, CheckCircle2, Hammer } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { space } from "@/src/constants/design-tokens";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import { StageHero } from "@/src/features/booking-orders/components/state-machine/shared";
import CompletionRequestPendingCard from "@/src/features/booking-orders/components/state-machine/shared/CompletionRequestPendingCard";
import {
	useTechCancel,
	useTechConfirmCompletion,
	useTechDeclineCompletion,
} from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { getErrorMessage } from "@/src/lib/errors";

interface Props {
	readonly order: Order;
}

export default function WorkCompleteBody({ order }: Props) {
	const userCompletedAt = order.user_completed_at ?? null;
	const techCompletedAt = order.technician_completed_at ?? null;
	const userRequested = userCompletedAt !== null && techCompletedAt === null;
	const techRequested = techCompletedAt !== null && userCompletedAt === null;
	const confirm = useTechConfirmCompletion();
	const decline = useTechDeclineCompletion();

	const fire = (mutation: typeof confirm, label: string) => {
		mutation.mutate(
			{ orderId: order.id },
			{
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: `Could not ${label}`,
						text2: getErrorMessage(err),
					}),
			},
		);
	};

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Hammer}
				eyebrow="Working"
				title="Job in motion."
				subtitle="Mark complete when done. Customer must confirm."
			/>
			{techRequested ? (
				<CompletionRequestPendingCard
					direction="awaiting_them"
					actorLabel="Customer"
					requestedAt={techCompletedAt}
					onDecline={() => fire(decline, "decline")}
					declinePending={decline.isPending}
				/>
			) : null}
			{userRequested ? (
				<CompletionRequestPendingCard
					direction="awaiting_me"
					actorLabel="Customer"
					requestedAt={userCompletedAt}
					onConfirm={() => fire(confirm, "confirm")}
					onDecline={() => fire(decline, "decline")}
					confirmPending={confirm.isPending}
					declinePending={decline.isPending}
				/>
			) : null}
		</View>
	);
}

export function WorkCompleteCta({ order }: Props) {
	const booking = order as unknown as TechnicianBooking;
	const userCompletedAt = order.user_completed_at ?? null;
	const techCompletedAt = order.technician_completed_at ?? null;
	const noPending = !userCompletedAt && !techCompletedAt;

	const confirm = useTechConfirmCompletion();
	const cancel = useTechCancel();
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
					Toast.show({ type: "success", text1: "Order cancelled" });
				},
				onError: (err) =>
					Toast.show({
						type: "info",
						text1: "Failed to cancel",
						text2: getErrorMessage(err),
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
											text1: "Could not confirm",
											text2: getErrorMessage(err),
										}),
								},
							)
						}
						loading={confirm.isPending}
					>
						Mark work complete
					</Button>
				</View>
				<View className="shrink-0">
					<Button
						variant="destructive"
						size="icon"
						accessibilityLabel="Cancel order"
						onPress={() => setCancelOpen(true)}
						loading={cancel.isPending}
					>
						<Ban size={20} />
					</Button>
				</View>
			</View>
			<CancelReasonModal
				visible={cancelOpen}
				title="Cancel Order"
				subjectRole="order"
				subjectName={booking.user_name ?? null}
				subjectFallback="this client"
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
