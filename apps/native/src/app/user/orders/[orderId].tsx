import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { space, useThemeColors } from "@/src/constants/design-tokens";
import DetailHeader from "@/src/features/booking-orders/components/shared/DetailHeader";
import {
	OrderSummaryScreen,
	PendingWaitingCard,
	StateScreenLayout,
} from "@/src/features/booking-orders/components/state-machine/shared";
import {
	AcceptedView,
	AcceptedViewCta,
	ArrivedInspectingView,
	ArrivedInspectingViewCta,
	AwaitingPaymentView,
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
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";

export default function OrderDetailScreen() {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const { orderId } = useLocalSearchParams<{ orderId: string }>();
	const order = useUserOrderById(orderId);
	const goBack = useSafeBack(ROUTES.user.activity);

	useOrderRealtimeInvalidate(
		orderId,
		order
			? !TERMINAL_STATUSES.has(order.status as LifecycleOrderStatus)
			: false,
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
			<StateScreenLayout
				order={order}
				viewer="user"
				stickyCta={cta}
				hidePartyHeader={lifecycleStatus === "awaiting_payment"}
			>
				{body}
			</StateScreenLayout>
		);
	}

	// Terminal orders land on the dedicated read-only summary (belt-and-braces:
	// works even on direct navigation to this live route).
	if (TERMINAL_STATUSES.has(lifecycleStatus)) {
		return <OrderSummaryScreen order={order} viewer="user" onBack={goBack} />;
	}

	return (
		<View testID="order-detail" className="flex-1 bg-surface">
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<KeyboardAvoidingView behavior="padding" className="flex-1">
					<DetailHeader
						categoryId={order.category_id}
						onBack={goBack}
						title={t("detail.orderTitle")}
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
						<PendingWaitingCard order={order} />
					</ScrollView>
				</KeyboardAvoidingView>
			</ScreenSafeAreaView>
		</View>
	);
}
