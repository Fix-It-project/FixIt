import { Ban, MapPin, Navigation } from "lucide-react-native";
import { useRef, useState } from "react";
import { Linking, View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import {
	CustomerInfoSheet,
	type CustomerInfoSheetHandle,
	IconActionButton,
	OrderInfoCompact,
	StageActionRow,
	StageHero,
	StagePrimaryAction,
} from "@/src/features/booking-orders/components/state-machine/shared";
import { BookingCancelModal } from "@/src/features/booking-orders/components/tech";
import {
	useOrderDistance,
	useTechCancel,
	useTechLocationPing,
	useTechMarkArrived,
} from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function TrackingBody({ order }: Props) {
	const themeColors = useThemeColors();
	const booking = order as unknown as TechnicianBooking;
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);

	const { permissionStatus, canAskAgain, requestPermission } =
		useTechLocationPing({ orderId: order.id, enabled: true });

	const { data: distance } = useOrderDistance(order.id, {
		enabled: true,
		viewer: "technician",
	});
	const km = distance?.distance_km;
	const eta =
		typeof distance?.eta_minutes === "number"
			? `${distance.eta_minutes} min`
			: null;
	const parts: string[] = [];
	if (typeof km === "number") parts.push(`${km.toFixed(1)} km away`);
	if (eta) parts.push(`ETA ${eta}`);
	if (parts.length === 0) parts.push("Live tracking");

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Navigation}
				eyebrow="En route"
				title="Driving to customer."
				subtitle="Tap arrived once you're within 1 km."
			/>
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
					className="font-google-sans-bold"
					style={{ color: themeColors.primary, fontSize: 13 }}
				>
					{parts.join(" · ")}
				</Text>
			</View>
			{permissionStatus !== "granted" ? (
				<View
					style={{
						borderRadius: radius.button,
						backgroundColor: `${themeColors.warning}14`,
						padding: space[3],
						flexDirection: "row",
						alignItems: "center",
						gap: space[2],
					}}
				>
					<Text variant="bodySm" style={{ color: themeColors.warning, flex: 1 }}>
						Location access needed for live ETA.
					</Text>
					<Text
						className="font-google-sans-bold"
						style={{ color: themeColors.primary, fontSize: 13 }}
						onPress={
							canAskAgain
								? requestPermission
								: () => Linking.openSettings()
						}
					>
						{canAskAgain ? "Grant" : "Open Settings"}
					</Text>
				</View>
			) : null}
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
			<CustomerInfoSheet ref={customerSheetRef} />
		</View>
	);
}

export function TrackingCta({ order }: Props) {
	const booking = order as unknown as TechnicianBooking;
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	const { data: distance } = useOrderDistance(order.id, {
		enabled: true,
		viewer: "technician",
	});
	const withinGeofence = distance?.within_geofence === true;
	const markArrived = useTechMarkArrived();
	const cancelMutation = useTechCancel();

	const handleArrive = () => {
		if (!withinGeofence) return;
		markArrived.mutate(
			{ orderId: order.id },
			{
				onError: (err: Error) =>
					Toast.show({
						type: "error",
						text1: "Couldn't mark arrived",
						text2: err.message ?? "Get within 1 km first",
					}),
			},
		);
	};

	const handleConfirmCancel = () => {
		const trimmed = cancelReason.trim();
		cancelMutation.mutate(
			{ orderId: order.id, reason: trimmed.length > 0 ? trimmed : undefined },
			{
				onSuccess: () => {
					setCancelOpen(false);
					setCancelReason("");
					Toast.show({ type: "success", text1: "Job cancelled" });
				},
				onError: (err) =>
					Toast.show({
						type: "error",
						text1: "Could not cancel",
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
						label={withinGeofence ? "I've arrived" : "Out of range"}
						icon={MapPin}
						onPress={handleArrive}
						disabled={!withinGeofence}
						pending={markArrived.isPending}
					/>
				}
				trailing={
					<IconActionButton
						icon={Ban}
						tone="danger"
						accessibilityLabel="Cancel job"
						onPress={() => setCancelOpen(true)}
					/>
				}
			/>
			<BookingCancelModal
				visible={cancelOpen}
				clientName={booking.user_name}
				reason={cancelReason}
				onReasonChange={setCancelReason}
				onClose={() => {
					if (cancelMutation.isPending) return;
					setCancelOpen(false);
				}}
				onConfirm={handleConfirmCancel}
				isLoading={cancelMutation.isPending}
			/>
		</>
	);
}
