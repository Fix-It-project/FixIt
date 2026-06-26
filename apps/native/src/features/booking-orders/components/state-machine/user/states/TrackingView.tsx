import { ExternalLink } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import Toast from "react-native-toast-message";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { space, useThemeColors } from "@/src/constants/design-tokens";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import OrderTrackingScreen from "@/src/features/booking-orders/components/shared/OrderTrackingScreen";
import {
	InspectionFeeRow,
	TrackingPartyRow,
	TrackingStagePills,
	TrackingStatusLine,
} from "@/src/features/booking-orders/components/shared/TrackingSheetParts";
import {
	useOrderDistance,
	useOrderLocation,
	useUserCancelOrder,
} from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { openCoordinatesInMaps } from "@/src/lib/maps/open-coordinates";

interface Props {
	readonly order: Order;
}

function useStatusText(orderId: string): string {
	const { t } = useTranslation("orders");
	const { data: distance } = useOrderDistance(orderId, {
		enabled: true,
		viewer: "user",
	});
	const parts: string[] = [];
	if (typeof distance?.eta_minutes === "number")
		parts.push(
			t("detail.distance.eta", {
				eta: t("detail.distance.min", { n: distance.eta_minutes }),
			}),
		);
	if (typeof distance?.distance_km === "number")
		parts.push(t("detail.distance.km", { n: distance.distance_km.toFixed(1) }));
	parts.push(t("detail.distance.live"));
	return parts.join(" · ");
}

export default function TrackingView({ order }: Props) {
	const { t } = useTranslation("orders");
	const colors = useThemeColors();
	const techLive = useOrderLocation(order.id, true);
	const statusText = useStatusText(order.id);
	const profileSheet = useRef<TechnicianProfileSheetRef>(null);

	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const cancel = useUserCancelOrder();

	const name = order.technician_name ?? t("detail.map.technician");
	const initials = getPfpInitialsFallback(name);

	// Floating stage pills over the map — tracking is always step 1 ("On the way").
	const isCard = order.payment_method === "card";
	const pillLabels = isCard
		? [
				t("detail.pills.onTheWay"),
				t("detail.pills.inspecting"),
				t("detail.pills.quote"),
				t("detail.pills.work"),
				t("detail.pills.payment"),
			]
		: [
				t("detail.pills.onTheWay"),
				t("detail.pills.inspecting"),
				t("detail.pills.quote"),
				t("detail.pills.work"),
			];

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
		<OrderTrackingScreen
			viewer="user"
			target={techLive}
			selfLabel={t("detail.map.you")}
			targetLabel={name}
			waitingLabel={t("detail.map.waiting")}
			backLabel={t("detail.a11y.back")}
			topSlot={<TrackingStagePills labels={pillLabels} />}
			peek={
				<>
					<TrackingPartyRow
						name={name}
						imageUrl={order.technician_image ?? null}
						initials={initials}
						avatarColor={getAvatarColor(name)}
						roleLabel={t("detail.stage.tracking.eyebrow")}
						ratingTechnicianId={order.technician_id ?? null}
						phone={order.technician_phone ?? null}
						callLabel={t("detail.a11y.call", {
							phone: order.technician_phone,
						})}
						onInfoPress={
							order.technician_id
								? () =>
										profileSheet.current?.open(order.technician_id, initials)
								: undefined
						}
						infoLabel={t("detail.a11y.openInfo", { name })}
					/>
					<TrackingStatusLine text={statusText} />
					<Button
						variant="primary"
						size="lg"
						fullWidth
						iconLeft={ExternalLink}
						disabled={!techLive}
						onPress={() =>
							openCoordinatesInMaps(techLive?.latitude, techLive?.longitude)
						}
					>
						{t("detail.map.openInMaps")}
					</Button>
				</>
			}
			expanded={
				<>
					<InspectionFeeRow
						label={t("detail.map.inspectionFee")}
						amount={order.inspection_fee}
					/>
					<Pressable
						accessibilityRole="button"
						accessibilityLabel={t("detail.a11y.cancelOrder")}
						onPress={() => setCancelOpen(true)}
						disabled={cancel.isPending}
						style={{ paddingVertical: space[2], alignItems: "center" }}
					>
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{ color: colors.danger }}
						>
							{t("detail.a11y.cancelOrder")}
						</Text>
					</Pressable>
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
					<TechnicianProfileSheet ref={profileSheet} />
				</>
			}
		/>
	);
}
