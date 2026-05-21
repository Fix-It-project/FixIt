import { Ban, CheckCircle2, Hammer } from "lucide-react-native";
import { useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import CompletionRequestPendingCard from "@/src/features/booking-orders/components/state-machine/shared/CompletionRequestPendingCard";
import {
	CustomerInfoSheet,
	type CustomerInfoSheetHandle,
	IconActionButton,
	OrderInfoCompact,
	StageActionRow,
	StageHero,
	StagePrimaryAction,
} from "@/src/features/booking-orders/components/state-machine/shared";
import OrderCancelModal from "@/src/features/booking-orders/components/user/OrderCancelModal";
import {
	useTechCancel,
	useTechConfirmCompletion,
	useTechDeclineCompletion,
} from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { space } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function WorkCompleteBody({ order }: Props) {
	const booking = order as unknown as TechnicianBooking;
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);
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
						type: "error",
						text1: `Could not ${label}`,
						text2: err.message,
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
			<CustomerInfoSheet ref={customerSheetRef} />
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
						type: "error",
						text1: "Failed to cancel",
						text2: err.message,
					}),
			},
		);
	};

	return (
		<>
			<StageActionRow
				primary={
					<StagePrimaryAction
						label="Mark work complete"
						icon={CheckCircle2}
						onPress={() =>
							confirm.mutate(
								{ orderId: order.id },
								{
									onError: (err) =>
										Toast.show({
											type: "error",
											text1: "Could not confirm",
											text2: err.message,
										}),
								},
							)
						}
						pending={confirm.isPending}
					/>
				}
				trailing={
					<IconActionButton
						icon={Ban}
						tone="danger"
						accessibilityLabel="Cancel order"
						onPress={() => setCancelOpen(true)}
						pending={cancel.isPending}
					/>
				}
			/>
			<OrderCancelModal
				visible={cancelOpen}
				technicianName={booking.user_name ?? null}
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
