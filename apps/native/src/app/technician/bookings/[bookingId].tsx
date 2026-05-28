import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, XCircle } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Text } from "@/src/components/ui/text";
import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import {
	OrderInfoCompact,
	StageHero,
	StateScreenLayout,
} from "@/src/features/booking-orders/components/state-machine/shared";
import {
	AcceptedActionsView,
	AcceptedCta,
	ArrivedInspectingActionsView,
	ArrivedInspectingCta,
	CashReceivedActionsView,
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
import { Button } from "@/src/components/ui/button";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/navigation";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

function isWizardStatus(status: LifecycleOrderStatus): boolean {
	return (
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
	const goBack = useSafeBack(ROUTES.technician.bookings);

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
			>
				{body}
			</StateScreenLayout>
		);
	}

	const bookingAsOrder = booking as unknown as Order;
	const isCompleted = booking.status === "completed";
	const isCancelledByUser = booking.status === "cancelled_by_user";
	const accent = isCompleted ? themeColors.success : themeColors.danger;
	const title = isCompleted ? "Job complete." : "Booking ended.";
	const subtitle = isCompleted
		? "Nice work. Payout follows your standard schedule."
		: isCancelledByUser
			? "Customer cancelled this booking."
			: "You cancelled this booking.";
	const icon = isCompleted ? CheckCircle2 : XCircle;
	const eyebrow = isCompleted ? "Done" : "Closed";
	const handleDone = () => {
		router.replace(ROUTES.technician.bookings);
	};

	return (
		<View className="flex-1 bg-surface">
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<DetailHeader
					categoryId={booking.category_id}
					onBack={goBack}
					title="Booking"
				/>
				<ScrollView
					className="flex-1"
					bounces={false}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: space[4],
						paddingTop: space[3],
						paddingBottom: space[10],
						gap: space[5],
					}}
				>
					<StageHero
						icon={icon}
						eyebrow={eyebrow}
						title={title}
						subtitle={subtitle}
						accentColor={accent}
					/>
					<OrderInfoCompact order={bookingAsOrder} viewer="technician" />
					{booking.cancellation_reason ? (
						<View
							style={{
								padding: space[4],
								borderRadius: radius.card,
								backgroundColor: `${themeColors.danger}14`,
								gap: space[1],
							}}
						>
							<Text
								variant="caption"
								className="font-google-sans-bold"
								style={{ color: themeColors.danger }}
							>
								Reason
							</Text>
							<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
								{booking.cancellation_reason}
							</Text>
						</View>
					) : null}
					<Button
						variant="primary"
						size="xl"
						fullWidth
						onPress={handleDone}
						style={{ marginTop: "auto" }}
					>
						Done
					</Button>
				</ScrollView>
			</ScreenSafeAreaView>
		</View>
	);
}
