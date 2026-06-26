import { MapPin, Navigation } from "lucide-react-native";
import { useRef, useState } from "react";
import { Linking, Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import CustomerActionsSheet, {
	type CustomerActionsSheetHandle,
} from "@/src/components/identity/CustomerActionsSheet";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";
import CancelReasonModal from "@/src/features/booking-orders/components/shared/CancelReasonModal";
import OrderTrackingScreen from "@/src/features/booking-orders/components/shared/OrderTrackingScreen";
import {
	InspectionFeeRow,
	TrackingDestinationCard,
	TrackingPartyRow,
	TrackingStagePills,
	TrackingStatusLine,
} from "@/src/features/booking-orders/components/shared/TrackingSheetParts";
import {
	useArrivalGeofence,
	useOrderDistance,
	useTechCancel,
	useTechMarkArrived,
	useTechTracking,
} from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { getAvatarColor } from "@/src/features/booking-orders/utils/booking-helpers";
import { translateOrderError } from "@/src/features/booking-orders/utils/translate-order-error";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { logger } from "@/src/lib/logger";
import { openDirectionsInMaps } from "@/src/lib/maps/open-coordinates";

interface Props {
	readonly order: Order;
}

export default function TrackingActionsView({ order }: Props) {
	const colors = useThemeColors();
	const booking = order as unknown as TechnicianBooking;
	const customerSheet = useRef<CustomerActionsSheetHandle>(null);

	const { permissionStatus, canAskAgain, requestPermission } = useTechTracking({
		orderId: order.id,
		active: true,
	});

	const { data: distance } = useOrderDistance(order.id, {
		enabled: true,
		viewer: "technician",
	});

	// Customer's booked address — the technician's destination + geofence anchor.
	const customer =
		typeof booking.user_latitude === "number" &&
		typeof booking.user_longitude === "number"
			? { latitude: booking.user_latitude, longitude: booking.user_longitude }
			: null;

	const { withinGeofence: localGeofence, confirmArrival } = useArrivalGeofence({
		orderId: order.id,
		destination: customer,
		active: true,
	});
	const arrivedServerSide = Boolean(
		(order as { arrived_at?: string | null }).arrived_at,
	);
	const withinGeofence = localGeofence || arrivedServerSide;

	const markArrived = useTechMarkArrived();
	const cancelMutation = useTechCancel();
	const [cancelOpen, setCancelOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	const parts: string[] = [];
	if (typeof distance?.eta_minutes === "number")
		parts.push(`ETA ${distance.eta_minutes} min`);
	if (typeof distance?.distance_km === "number")
		parts.push(`${distance.distance_km.toFixed(1)} km`);
	parts.push("Live");
	const statusText = parts.join(" · ");

	const name = booking.user_name ?? "Customer";

	// Floating stage pills over the map — tracking is always step 1 ("On the way").
	const pillLabels =
		booking.payment_method === "card"
			? ["On the way", "Inspecting", "Quote", "Work", "Payment"]
			: ["On the way", "Inspecting", "Quote", "Work"];

	const handleArrive = async () => {
		if (!withinGeofence) return;
		// UI-enable != backend-ready: send a fresh ping so the server has registered
		// arrival (`arrived_at`) before we mark arrived, else the transition can fail
		// with arrival_not_detected_yet / too_far_from_destination.
		await confirmArrival();
		markArrived.mutate(
			{ orderId: order.id },
			{
				onError: (err) => {
					logger.warn("booking.lifecycle", "mark_arrived_failed", {
						orderId: order.id,
					});
					Toast.show({
						type: "info",
						text1: "Couldn't mark arrived",
						text2: translateOrderError(err),
					});
				},
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
				onError: (err) => {
					logger.warn("booking.lifecycle", "tracking_cancel_failed", {
						orderId: order.id,
					});
					Toast.show({
						type: "info",
						text1: "Could not cancel",
						text2: translateOrderError(err),
					});
				},
			},
		);
	};

	const navigate = () =>
		openDirectionsInMaps(customer?.latitude, customer?.longitude);

	const openCustomerInfo = () =>
		customerSheet.current?.open({
			name: booking.user_name ?? "Customer",
			phone: booking.user_phone ?? null,
			address: booking.user_address ?? null,
			latitude: booking.user_latitude ?? null,
			longitude: booking.user_longitude ?? null,
			problem: order.problem_description ?? null,
		});

	return (
		<OrderTrackingScreen
			viewer="technician"
			target={customer}
			selfLabel="You"
			targetLabel={name}
			waitingLabel="Customer location unavailable."
			backLabel="Back"
			topSlot={
				<View style={{ gap: space[2] }}>
					<TrackingStagePills labels={pillLabels} />
					{booking.user_address ? (
						<TrackingDestinationCard
							label="Destination"
							address={booking.user_address}
						/>
					) : null}
				</View>
			}
			peek={
				<>
					<TrackingPartyRow
						name={name}
						imageUrl={null}
						initials={getPfpInitialsFallback(name)}
						avatarColor={getAvatarColor(name)}
						roleLabel="Customer"
						phone={booking.user_phone ?? null}
						callLabel={`Call ${booking.user_phone ?? ""}`}
						onInfoPress={openCustomerInfo}
						infoLabel="Customer details"
					/>
					<TrackingStatusLine text={statusText} />
					{/* Adaptive primary: navigate while driving, arrive once in range. */}
					{withinGeofence ? (
						<Button
							variant="primary"
							size="lg"
							fullWidth
							iconLeft={MapPin}
							onPress={handleArrive}
							loading={markArrived.isPending}
						>
							I've arrived
						</Button>
					) : (
						<Button
							variant="primary"
							size="lg"
							fullWidth
							iconLeft={Navigation}
							disabled={!customer}
							onPress={navigate}
						>
							Navigate in Google Maps
						</Button>
					)}
				</>
			}
			expanded={
				<>
					{/* The other action. */}
					{withinGeofence ? (
						<Button
							variant="tonal"
							size="md"
							fullWidth
							iconLeft={Navigation}
							disabled={!customer}
							onPress={navigate}
						>
							Navigate in Google Maps
						</Button>
					) : (
						<Button
							variant="tonal"
							size="md"
							fullWidth
							iconLeft={MapPin}
							disabled
							onPress={() => {}}
						>
							Arrive once within 1 km
						</Button>
					)}

					<InspectionFeeRow
						label="Inspection fee"
						amount={booking.inspection_fee}
					/>

					{permissionStatus !== "granted" ? (
						<View
							style={{
								borderRadius: radius.button,
								backgroundColor: `${colors.warning}14`,
								padding: space[3],
								flexDirection: "row",
								alignItems: "center",
								gap: space[2],
							}}
						>
							<Text variant="bodySm" style={{ color: colors.warning, flex: 1 }}>
								Location access needed for live ETA.
							</Text>
							<Text
								variant="bodySm"
								className="font-google-sans-bold"
								style={{ color: colors.primary }}
								onPress={
									canAskAgain ? requestPermission : () => Linking.openSettings()
								}
							>
								{canAskAgain ? "Grant" : "Open Settings"}
							</Text>
						</View>
					) : null}

					<Pressable
						accessibilityRole="button"
						accessibilityLabel="Cancel job"
						onPress={() => setCancelOpen(true)}
						disabled={cancelMutation.isPending}
						style={{ paddingVertical: space[2], alignItems: "center" }}
					>
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{ color: colors.danger }}
						>
							Cancel job
						</Text>
					</Pressable>

					<CancelReasonModal
						visible={cancelOpen}
						title="Cancel Booking"
						subjectRole="booking"
						subjectName={booking.user_name}
						subjectFallback="this client"
						reason={cancelReason}
						onReasonChange={setCancelReason}
						onClose={() => {
							if (cancelMutation.isPending) return;
							setCancelOpen(false);
						}}
						onConfirm={handleConfirmCancel}
						isLoading={cancelMutation.isPending}
					/>
					<CustomerActionsSheet ref={customerSheet} />
				</>
			}
		/>
	);
}
