import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { RequestCard } from "./RequestCard";
import { SectionHeader } from "./SectionHeader";

export function IncomingRequestsSection() {
	const { t } = useTranslation("technician");
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

	// Collapse when empty — no dead card at the top of the page.
	if (pending.length === 0) return null;

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader
				title={t("home.sections.incomingRequests")}
				hint={t("home.requests.waiting", { count: pending.length })}
			/>

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

			{/* decline reason dialog */}
			<AlertDialog visible={decliningId !== null} onClose={closeDeclineDialog}>
				<AlertDialog.Header>
					<AlertDialogTitle>
						<Text variant="h3" className="font-bold text-content">
							{t("home.requests.dialogTitle")}
						</Text>
					</AlertDialogTitle>
				</AlertDialog.Header>
				<AlertDialog.Body>
					<AlertDialogDescription>
						<Text variant="caption" className="text-content-muted">
							{t("home.requests.dialogBody")}
						</Text>
					</AlertDialogDescription>
					<Textarea
						value={reason}
						onChangeText={setReason}
						placeholder={t("home.requests.reasonPlaceholder")}
						maxLength={500}
						className="mt-stack-sm"
					/>
				</AlertDialog.Body>
				<AlertDialog.Footer>
					<Button variant="secondary" size="md" onPress={closeDeclineDialog}>
						<Text variant="buttonMd" className="text-content">
							{t("home.requests.keepRequest")}
						</Text>
					</Button>
					<Button
						variant="destructive"
						size="md"
						onPress={confirmDecline}
						disabled={decline.isPending}
					>
						<Text variant="buttonMd" className="text-surface-on-primary">
							{t("home.requests.decline")}
						</Text>
					</Button>
				</AlertDialog.Footer>
			</AlertDialog>
		</View>
	);
}
