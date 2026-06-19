import { Ban, MapPin, Navigation } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { StageHero } from "@/src/features/booking-orders/components/state-machine/shared";
import {
	useOrderDistance,
	useUserCancelOrder,
} from "@/src/features/booking-orders/hooks";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import { radius, space, spacing, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

function Distance({ orderId }: { orderId: string }) {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const { data: distance } = useOrderDistance(orderId, {
		enabled: true,
		viewer: "user",
	});
	const km = distance?.distance_km;
	const eta =
		typeof distance?.eta_minutes === "number"
			? t("detail.distance.min", { n: distance.eta_minutes })
			: null;
	const parts: string[] = [];
	if (typeof km === "number")
		parts.push(t("detail.distance.km", { n: km.toFixed(1) }));
	if (eta) parts.push(t("detail.distance.eta", { eta }));
	parts.push(t("detail.distance.live"));
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
	const { t } = useTranslation("orders");
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Navigation}
				eyebrow={t("detail.stage.tracking.eyebrow")}
				title={t("detail.stage.tracking.title")}
				subtitle={t("detail.stage.tracking.subtitle")}
			/>
			<Distance orderId={order.id} />
		</View>
	);
}

export function TrackingViewCta({ order }: Props) {
	const { t } = useTranslation("orders");
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
						iconLeft={Navigation}
						onPress={() => {}}
						disabled
					>
						{t("detail.cta.liveTracking")}
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
				onConfirm={handleConfirm}
				isLoading={cancel.isPending}
			/>
		</>
	);
}
