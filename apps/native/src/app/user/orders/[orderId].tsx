import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import {
	PendingWaitingCard,
	StateScreenLayout,
} from "@/src/features/booking-orders/components/state-machine/shared";
import {
	AcceptedView,
	AcceptedViewCta,
	ArrivedInspectingView,
	ArrivedInspectingViewCta,
	AwaitingPaymentView,
	CancelledView,
	CompletedView,
	QuoteView,
	QuoteViewCta,
	TrackingView,
	TrackingViewCta,
	WorkInProgressView,
	WorkInProgressViewCta,
} from "@/src/features/booking-orders/components/state-machine/user/states";
import { useOrderRealtimeInvalidate } from "@/src/features/booking-orders/hooks/useOrderRealtimeInvalidate";
import { useUserOrderById } from "@/src/features/booking-orders/hooks/useUserOrders";
import {
	IN_PROGRESS_STATUSES,
	type OrderStatus as LifecycleOrderStatus,
	TERMINAL_STATUSES,
} from "@/src/features/booking-orders/schemas/order-status.schema";
import { deriveUiState } from "@/src/features/booking-orders/utils/derive-ui-state";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";
import { space, useThemeColors } from "@/src/lib/theme";

export default function OrderDetailScreen() {
	const themeColors = useThemeColors();
	const { orderId } = useLocalSearchParams<{ orderId: string }>();
	const order = useUserOrderById(orderId);
	const goBack = useSafeBack(ROUTES.user.orders);

	useOrderRealtimeInvalidate(
		orderId,
		order ? !TERMINAL_STATUSES.has(order.status as LifecycleOrderStatus) : false,
	);

	useFocusBackHandler(() => {
		goBack();
		return true;
	});

	if (!order) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	}

	const ui = deriveUiState(order, "user");
	const lifecycleStatus = order.status as unknown as LifecycleOrderStatus;
	const isInProgress = IN_PROGRESS_STATUSES.has(lifecycleStatus);

	if (
		lifecycleStatus === "accepted" ||
		lifecycleStatus === "reschedule_requested_by_user" ||
		lifecycleStatus === "reschedule_requested_by_technician"
	) {
		return (
			<StateScreenLayout
				order={order}
				viewer="user"
				stickyCta={<AcceptedViewCta order={order} />}
			>
				<AcceptedView order={order} />
			</StateScreenLayout>
		);
	}

	if (isInProgress) {
		let body: ReactNode;
		let cta: ReactNode = null;
		switch (lifecycleStatus) {
			case "tracking":
				body = <TrackingView order={order} />;
				cta = <TrackingViewCta order={order} />;
				break;
			case "arrived_inspection":
				body = <ArrivedInspectingView order={order} />;
				cta = <ArrivedInspectingViewCta order={order} />;
				break;
			case "in_progress":
				body = <WorkInProgressView order={order} />;
				cta = <WorkInProgressViewCta order={order} />;
				break;
			case "awaiting_final_cost":
			case "negotiating":
				body = <QuoteView order={order} />;
				cta = <QuoteViewCta order={order} />;
				break;
			case "awaiting_payment":
				body = <AwaitingPaymentView order={order} />;
				cta = null;
				break;
			default:
				body = null;
		}
		return (
			<StateScreenLayout order={order} viewer="user" stickyCta={cta}>
				{body}
			</StateScreenLayout>
		);
	}

	const isWaitingToAccept = ui.phase === "waiting_to_accept";
	const isCompleted = ui.phase === "completed";
	const isCancelled = ui.phase === "cancelled";

	return (
		<View className="flex-1 bg-surface">
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<KeyboardAvoidingView behavior="padding" className="flex-1">
					<DetailHeader
						categoryId={order.category_id}
						onBack={goBack}
						title="Order"
					/>
					<ScrollView
						className="flex-1"
						bounces={false}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{
							flexGrow: 1,
							paddingHorizontal: space[4],
							paddingTop: space[3],
							paddingBottom: space[10],
						}}
					>
						{isWaitingToAccept && <PendingWaitingCard order={order} />}
						{isCompleted && <CompletedView order={order} />}
						{isCancelled && <CancelledView order={order} />}
					</ScrollView>
				</KeyboardAvoidingView>
			</ScreenSafeAreaView>
		</View>
	);
}
