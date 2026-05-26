import { Ban, MapPin, Navigation } from "lucide-react-native";
import { useRef, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import {
	IconActionButton,
	OrderInfoCompact,
	StageActionRow,
	StageHero,
	StagePrimaryAction,
} from "@/src/features/booking-orders/components/state-machine/shared";
import {
	useOrderDistance,
	useUserCancelOrder,
} from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import OrderCancelModal from "@/src/features/booking-orders/components/user/OrderCancelModal";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

function Distance({ orderId }: { orderId: string }) {
	const themeColors = useThemeColors();
	const { data: distance } = useOrderDistance(orderId, {
		enabled: true,
		viewer: "user",
	});
	const km = distance?.distance_km;
	const eta =
		typeof distance?.eta_minutes === "number"
			? `${distance.eta_minutes} min`
			: null;
	const parts: string[] = [];
	if (typeof km === "number") parts.push(`${km.toFixed(1)} km`);
	if (eta) parts.push(`ETA ${eta}`);
	parts.push("Live");
	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: space[2],
				paddingHorizontal: space[3],
				paddingVertical: space[2],
				borderRadius: radius.pill,
				backgroundColor: `${themeColors.primary}14`,
				alignSelf: "flex-start",
			}}
		>
			<MapPin size={spacing.icon.caption} color={themeColors.primary} strokeWidth={2.4} />
			<Text
				variant="bodySm"
				className="font-google-sans-bold"
				style={{ color: themeColors.primary }}
			>
				{parts.join(" · ")}
			</Text>
		</View>
	);
}

export default function TrackingView({ order }: Props) {
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Navigation}
				eyebrow="On the way"
				title="Heading your way."
				subtitle="Track the ETA. Your technician is moving toward you."
			/>
			<Distance orderId={order.id} />
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
			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}

export function TrackingViewCta({ order }: Props) {
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const cancel = useUserCancelOrder();

	const handleConfirm = () => {
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
						label="Live tracking"
						icon={Navigation}
						onPress={() => {}}
						disabled
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
				technicianName={order.technician_name}
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (cancel.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirm}
				isLoading={cancel.isPending}
			/>
		</>
	);
}
