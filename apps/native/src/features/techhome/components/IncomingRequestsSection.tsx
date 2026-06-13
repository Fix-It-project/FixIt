import { useState } from "react";
import { View } from "react-native";
import {
	AlertDialog,
	AlertDialogDescription,
	AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import {
	useAcceptOrderMutation,
	useDeclineOrderMutation,
} from "../hooks/useOrderActionMutations";
import { usePendingRequests } from "../hooks/useTechHomeOrdersQuery";
import { useTechHomeStatsQuery } from "../hooks/useTechHomeStatsQuery";
import { EmptyState } from "./EmptyState";
import { RequestCard } from "./RequestCard";
import { SectionHeader } from "./SectionHeader";

export function IncomingRequestsSection() {
	const { data: pending } = usePendingRequests();
	const { data: stats } = useTechHomeStatsQuery();
	const accept = useAcceptOrderMutation();
	const decline = useDeclineOrderMutation();

	const [decliningId, setDecliningId] = useState<string | null>(null);
	const [reason, setReason] = useState("");

	const closeDeclineDialog = () => {
		setDecliningId(null);
		setReason("");
	};

	const confirmDecline = () => {
		if (!decliningId) return;
		decline.mutate(
			{ orderId: decliningId, reason: reason.trim() || undefined },
			{ onSuccess: closeDeclineDialog, onError: closeDeclineDialog },
		);
	};

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader
				title="Incoming requests"
				hint={
					pending.length > 0
						? `${pending.length} waiting for your decision`
						: "New bookings land here"
				}
			/>

			{pending.length === 0 ? (
				<EmptyState
					title="No new requests"
					body="When a customer books you, the request shows up here to accept or decline."
				/>
			) : (
				<View className="gap-stack-sm">
					{pending.map((order) => (
						<RequestCard
							key={order.id}
							order={order}
							pendingExpiryHours={stats?.pendingExpiryHours}
							onAccept={() => accept.mutate(order.id)}
							onDecline={() => setDecliningId(order.id)}
							actionPending={accept.isPending || decline.isPending}
						/>
					))}
				</View>
			)}

			{/* decline reason dialog */}
			<AlertDialog visible={decliningId !== null} onClose={closeDeclineDialog}>
				<AlertDialog.Header>
					<AlertDialogTitle>
						<Text variant="h4" className="font-bold text-content">
							Decline this request?
						</Text>
					</AlertDialogTitle>
				</AlertDialog.Header>
				<AlertDialog.Body>
					<AlertDialogDescription>
						<Text variant="bodySm" className="text-content-muted">
							Optionally tell the customer why. Declining often hurts your
							acceptance rate.
						</Text>
					</AlertDialogDescription>
					<Textarea
						value={reason}
						onChangeText={setReason}
						placeholder="Reason (optional)"
						maxLength={500}
						className="mt-stack-sm"
					/>
				</AlertDialog.Body>
				<AlertDialog.Footer>
					<Button variant="secondary" size="md" onPress={closeDeclineDialog}>
						<Text variant="buttonMd" className="text-content">
							Keep request
						</Text>
					</Button>
					<Button
						variant="destructive"
						size="md"
						onPress={confirmDecline}
						disabled={decline.isPending}
					>
						<Text variant="buttonMd" className="text-surface-on-primary">
							Decline
						</Text>
					</Button>
				</AlertDialog.Footer>
			</AlertDialog>
		</View>
	);
}
