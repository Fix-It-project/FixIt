import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	OrderSummaryScreen,
	StateScreenLayout,
} from "@/src/features/booking-orders/components/state-machine/shared";
import {
	AcceptedActionsView,
	AcceptedCta,
	ArrivedInspectingActionsView,
	ArrivedInspectingCta,
	CashReceivedActionsView,
	PendingActionsView,
	PendingCta,
	QuoteActionsView,
	QuoteCta,
	TrackingActionsView,
	TrackingCta,
	WorkCompleteActionsView,
	WorkCompleteCta,
} from "@/src/features/booking-orders/components/state-machine/tech/states";
import { useOrderRealtimeInvalidate } from "@/src/features/booking-orders/hooks/useOrderRealtimeInvalidate";
import { useTechnicianBookingById } from "@/src/features/booking-orders/hooks/useTechnicianBookingsQuery";
import {
	IN_PROGRESS_STATUSES,
	type OrderStatus as LifecycleOrderStatus,
	TERMINAL_STATUSES,
} from "@/src/features/booking-orders/schemas/order-status.schema";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

function isWizardStatus(status: LifecycleOrderStatus): boolean {
	return (
		status === "pending" ||
		status === "accepted" ||
		status === "reschedule_requested_by_user" ||
		status === "reschedule_requested_by_technician" ||
		IN_PROGRESS_STATUSES.has(status)
	);
}

export default function BookingDetailScreen() {
	const themeColors = useThemeColors();
	const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
	const booking = useTechnicianBookingById(bookingId);
	const goBack = useSafeBack(ROUTES.technician.jobs);

	useOrderRealtimeInvalidate(
		bookingId,
		booking
			? !TERMINAL_STATUSES.has(booking.status as LifecycleOrderStatus)
			: false,
	);

	useFocusBackHandler(() => {
		goBack();
		return true;
	});

	if (!booking) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	}

	const lifecycleStatus = booking.status as unknown as LifecycleOrderStatus;
	if (isWizardStatus(lifecycleStatus)) {
		const bookingAsOrder = booking as unknown as Order;
		let body: ReactNode = null;
		let cta: ReactNode = null;
		switch (lifecycleStatus) {
			case "pending":
				body = <PendingActionsView order={bookingAsOrder} />;
				cta = <PendingCta order={bookingAsOrder} />;
				break;
			case "accepted":
				body = <AcceptedActionsView order={bookingAsOrder} />;
				cta = <AcceptedCta order={bookingAsOrder} />;
				break;
			case "reschedule_requested_by_user":
			case "reschedule_requested_by_technician":
				body = <AcceptedActionsView order={bookingAsOrder} />;
				cta = <AcceptedCta order={bookingAsOrder} />;
				break;
			case "tracking":
				body = <TrackingActionsView order={bookingAsOrder} />;
				cta = <TrackingCta order={bookingAsOrder} />;
				break;
			case "arrived_inspection":
				body = <ArrivedInspectingActionsView order={bookingAsOrder} />;
				cta = <ArrivedInspectingCta order={bookingAsOrder} />;
				break;
			case "awaiting_final_cost":
			case "negotiating":
				body = <QuoteActionsView order={bookingAsOrder} />;
				cta = <QuoteCta order={bookingAsOrder} />;
				break;
			case "in_progress":
				body = <WorkCompleteActionsView order={bookingAsOrder} />;
				cta = <WorkCompleteCta order={bookingAsOrder} />;
				break;
			case "awaiting_payment":
				body = <CashReceivedActionsView order={bookingAsOrder} />;
				cta = null;
				break;
			default:
				body = null;
		}
		return (
			<StateScreenLayout
				order={bookingAsOrder}
				viewer="technician"
				stickyCta={cta}
				hidePills={lifecycleStatus === "pending"}
			>
				{body}
			</StateScreenLayout>
		);
	}

	// Terminal bookings land on the dedicated read-only summary.
	const bookingAsOrder = booking as unknown as Order;
	return (
		<OrderSummaryScreen
			order={bookingAsOrder}
			viewer="technician"
			onBack={goBack}
		/>
	);
}
