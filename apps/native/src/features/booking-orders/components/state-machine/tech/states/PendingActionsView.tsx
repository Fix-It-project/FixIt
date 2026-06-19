import { Check, Inbox, X } from "lucide-react-native";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { confirm } from "@/src/components/ui/dialog";
import { space, useThemeColors } from "@/src/constants/design-tokens";
import { StageHero } from "@/src/features/booking-orders/components/state-machine/shared";
import {
	useTechAccept,
	useTechDecline,
} from "@/src/features/booking-orders/hooks/useTechLifecycleMutations";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import {
	extractOrderErrorToken,
	translateOrderError,
} from "@/src/features/booking-orders/utils/translate-order-error";
import { logger } from "@/src/lib/logger";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

interface Props {
	readonly order: Order;
}

/** Detail view for an incoming (pending) request — full info + maps, so a tech
 *  arriving from a notification can decide right here. Fixes the old bug where
 *  pending fell through to the terminal "Done" screen. */
export default function PendingActionsView(_props: Props) {
	const themeColors = useThemeColors();

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Inbox}
				eyebrow="New request"
				title="New job request."
				subtitle="Review the details, then accept to lock it in or decline to release it."
				accentColor={themeColors.primary}
			/>
		</View>
	);
}

export function PendingCta({ order }: Props) {
	const accept = useTechAccept();
	const decline = useTechDecline();
	const goBack = useSafeBack(ROUTES.technician.jobs);
	const pending = accept.isPending || decline.isPending;

	const handleAccept = () => {
		accept.mutate(
			{ orderId: order.id },
			{
				onSuccess: () => Toast.show({ type: "success", text1: "Job accepted" }),
				onError: (err) => {
					logger.warn("booking.lifecycle", "pending_accept_failed", {
						orderId: order.id,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: "Couldn't accept",
						text2: translateOrderError(err),
					});
				},
			},
		);
	};

	const handleDecline = async () => {
		const ok = await confirm({
			title: "Decline this request?",
			description: "The job goes back to the pool for other technicians.",
			primary: { label: "Decline", destructive: true },
			secondary: { label: "Keep" },
		});
		if (!ok) return;
		decline.mutate(
			{ orderId: order.id },
			{
				onSuccess: () => {
					Toast.show({ type: "success", text1: "Request declined" });
					goBack();
				},
				onError: (err) => {
					logger.warn("booking.lifecycle", "pending_decline_failed", {
						orderId: order.id,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: "Couldn't decline",
						text2: translateOrderError(err),
					});
				},
			},
		);
	};

	return (
		<View className="flex-row items-center gap-stack-md">
			<View className="shrink-0">
				<Button
					variant="secondary"
					size="lg"
					iconLeft={X}
					onPress={handleDecline}
					disabled={pending}
				>
					Decline
				</Button>
			</View>
			<View className="flex-1">
				<Button
					variant="primary"
					size="lg"
					fullWidth
					iconLeft={Check}
					onPress={handleAccept}
					loading={accept.isPending}
					disabled={pending}
				>
					Accept job
				</Button>
			</View>
		</View>
	);
}
