import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
	Check,
	CheckCircle2,
	Circle,
	CreditCard,
	Wallet,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import CustomerInfoSheet, {
	type CustomerActionsSheetHandle as CustomerInfoSheetHandle,
} from "@/src/components/identity/CustomerActionsSheet";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { DUR_STAGGER, STAGGER_GAP } from "@/src/constants/animation";
import {
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import {
	useUserCreateCardSession,
	useUserSwitchToCash,
} from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { getDateLocale } from "@/src/features/booking-orders/utils/booking-helpers";
import { formatAmount } from "@/src/features/booking-orders/utils/format-currency";
import { showError } from "@/src/lib/errors";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import OrderInfoCompact from "./OrderInfoCompact";
import StageHero from "./StageHero";

export type SummaryViewer = "user" | "technician";

interface Props {
	readonly order: Order;
	readonly viewer: SummaryViewer;
}

interface TimelineRow {
	label: string;
	timestamp: string | null;
}

function formatTimestamp(
	value: string | null | undefined,
	language?: string,
): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString(getDateLocale(language), {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function OrderSummaryFinalize({ order, viewer }: Props) {
	const { t, i18n } = useTranslation("orders");
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const queryClient = useQueryClient();
	const userCreateCardSession = useUserCreateCardSession();
	const userSwitchToCash = useUserSwitchToCash();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);
	const [isPollingForCard, setIsPollingForCard] = useState(false);

	const isUser = viewer === "user";
	const booking = order as unknown as TechnicianBooking;
	const userConfirmed = order.user_completed_at != null;
	const techConfirmed = order.technician_completed_at != null;
	const otherConfirmed = isUser ? techConfirmed : userConfirmed;
	const meConfirmed = isUser ? userConfirmed : techConfirmed;

	useEffect(() => {
		if (!isPollingForCard) return;
		if (order.status === "completed") {
			setIsPollingForCard(false);
			return;
		}
		const startedAt = Date.now();
		const interval = setInterval(() => {
			void queryClient.invalidateQueries({ queryKey: ["user-orders"] });
			if (Date.now() - startedAt >= 45_000) {
				clearInterval(interval);
				setIsPollingForCard(false);
			}
		}, 3000);
		return () => clearInterval(interval);
	}, [isPollingForCard, order.status, queryClient]);

	// "Pay cash instead": complete the order off-site (escape a stuck card payment).
	const handleSwitchToCash = () => {
		userSwitchToCash.mutate({ orderId: order.id });
	};

	const handleCardCheckout = async () => {
		try {
			// Payment method is already 'card' (chosen upfront). Open the gateway in
			// the in-app webview; the webhook flips the order to completed and the
			// poll below picks it up once the webview returns.
			const session = await userCreateCardSession.mutateAsync({
				orderId: order.id,
			});
			setIsPollingForCard(true);
			router.push(ROUTES.user.paymentCheckout(session.checkoutUrl));
		} catch (error) {
			setIsPollingForCard(false);
			showError(error);
		}
	};

	const fadeIn = (i: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(i * STAGGER_GAP).duration(DUR_STAGGER);

	const counterpartyLabel = isUser
		? t("card.technicianFallback")
		: t("card.customerFallback");
	const workCompletedAt =
		order.user_completed_at && order.technician_completed_at
			? new Date(order.user_completed_at) >
				new Date(order.technician_completed_at)
				? order.user_completed_at
				: order.technician_completed_at
			: (order.user_completed_at ?? order.technician_completed_at ?? null);

	const timeline: TimelineRow[] = [
		{
			label: t("detail.finalize.orderPlaced"),
			timestamp: order.created_at ?? null,
		},
		{
			label: t("detail.finalize.techArrived"),
			timestamp: order.arrived_at ?? null,
		},
		{ label: t("detail.finalize.workComplete"), timestamp: workCompletedAt },
	];

	const inspectionFee = order.inspection_fee ?? 0;
	const workAmount =
		order.work_price ?? order.estimated_price ?? order.final_price ?? 0;
	const finalAmount = order.final_price ?? workAmount + inspectionFee;

	const onIdentityPress = () => {
		if (isUser) {
			profileSheetRef.current?.open(
				order.technician_id,
				getPfpInitialsFallback(order.technician_name),
			);
		} else {
			customerSheetRef.current?.open({
				name: booking.user_name ?? t("card.customerFallback"),
				phone: booking.user_phone ?? null,
				address: booking.user_address ?? null,
				latitude: booking.user_latitude ?? null,
				longitude: booking.user_longitude ?? null,
				problem: order.problem_description ?? null,
			});
		}
	};

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={CheckCircle2}
				eyebrow={t("detail.finalize.eyebrow")}
				title={t("detail.finalize.title")}
				subtitle={t("detail.finalize.subtitle")}
			/>

			<Animated.View entering={fadeIn(0)}>
				<View
					style={{
						borderRadius: radius.card,
						backgroundColor: themeColors.primary,
						padding: space[4],
						gap: space[1],
					}}
				>
					<Text
						variant="caption"
						className="font-google-sans-bold"
						style={{
							color: themeColors.onPrimaryHeader,
							opacity: 0.78,
						}}
					>
						{t("detail.finalize.finalPrice")}
					</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "baseline",
							gap: space[2],
						}}
					>
						<Text
							variant="h2"
							className="font-google-sans-bold"
							style={{
								color: themeColors.onPrimaryHeader,
							}}
						>
							{formatAmount(finalAmount)}
						</Text>
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{
								color: themeColors.onPrimaryHeader,
								opacity: 0.85,
							}}
						>
							{t("detail.finalize.currency")}
						</Text>
					</View>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							gap: space[2],
							marginTop: space[1],
						}}
					>
						<Wallet
							size={spacing.icon.caption}
							color={themeColors.onPrimaryHeader}
							strokeWidth={2.4}
						/>
						<Text
							variant="caption"
							style={{
								color: themeColors.onPrimaryHeader,
								opacity: 0.85,
							}}
						>
							{t("detail.finalize.cashNote")}
						</Text>
					</View>
					<View
						style={{
							marginTop: space[3],
							borderTopWidth: 1,
							borderTopColor: `${themeColors.onPrimaryHeader}22`,
							paddingTop: space[3],
							gap: space[2],
						}}
					>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Text
								variant="caption"
								style={{
									color: themeColors.onPrimaryHeader,
									opacity: 0.82,
								}}
							>
								{t("detail.finalize.workPrice")}
							</Text>
							<Text
								variant="caption"
								className="font-google-sans-bold"
								style={{
									color: themeColors.onPrimaryHeader,
								}}
							>
								{formatAmount(workAmount)} EGP
							</Text>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Text
								variant="caption"
								style={{
									color: themeColors.onPrimaryHeader,
									opacity: 0.82,
								}}
							>
								{t("detail.finalize.inspectionFee")}
							</Text>
							<Text
								variant="caption"
								className="font-google-sans-bold"
								style={{
									color: themeColors.onPrimaryHeader,
								}}
							>
								{formatAmount(inspectionFee)} EGP
							</Text>
						</View>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Text
								variant="bodySm"
								className="font-google-sans-bold"
								style={{
									color: themeColors.onPrimaryHeader,
								}}
							>
								{t("detail.finalize.totalPayable")}
							</Text>
							<Text
								variant="caption"
								className="font-google-sans-bold"
								style={{
									color: themeColors.onPrimaryHeader,
								}}
							>
								{formatAmount(finalAmount)} EGP
							</Text>
						</View>
					</View>
				</View>
			</Animated.View>

			<OrderInfoCompact
				order={order}
				viewer={viewer}
				onIdentityPress={onIdentityPress}
			/>

			<Animated.View entering={fadeIn(1)}>
				<View
					style={{
						borderRadius: radius.card,
						backgroundColor: themeColors.surfaceElevated,
						padding: space[4],
						gap: space[3],
					}}
				>
					<Text
						variant="caption"
						className="font-google-sans-bold"
						style={{ color: themeColors.textMuted }}
					>
						{t("detail.finalize.timeline")}
					</Text>
					{timeline.map((row) => (
						<View
							key={row.label}
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: space[3],
							}}
						>
							{row.timestamp ? (
								<View
									style={{
										width: 20,
										height: 20,
										borderRadius: radius.pill,
										alignItems: "center",
										justifyContent: "center",
										backgroundColor: themeColors.primary,
									}}
								>
									<Check
										size={spacing.icon.caption}
										color={themeColors.onPrimaryHeader}
										strokeWidth={3}
									/>
								</View>
							) : (
								<Circle
									size={spacing.icon.sm}
									color={themeColors.borderDefault}
								/>
							)}
							<Text
								variant="bodySm"
								style={{
									flex: 1,
									color: row.timestamp
										? themeColors.textPrimary
										: themeColors.textMuted,
								}}
							>
								{row.label}
							</Text>
							<Text variant="caption" style={{ color: themeColors.textMuted }}>
								{formatTimestamp(row.timestamp, i18n.language)}
							</Text>
						</View>
					))}
				</View>
			</Animated.View>

			{otherConfirmed && !meConfirmed ? (
				<Animated.View entering={fadeIn(2)}>
					<View
						style={{
							borderRadius: radius.card,
							padding: space[3],
							flexDirection: "row",
							alignItems: "center",
							gap: space[2],
							backgroundColor: themeColors.success,
						}}
					>
						<CheckCircle2
							size={spacing.icon.xs}
							color={themeColors.onPrimaryHeader}
							strokeWidth={2.4}
						/>
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{ color: themeColors.onPrimaryHeader, flex: 1 }}
						>
							{t("detail.finalize.confirmedTapFinalize", {
								role: counterpartyLabel,
							})}
						</Text>
					</View>
				</Animated.View>
			) : null}

			{isUser ? (
				<View className="gap-3">
					<Button
						variant="primary"
						size="lg"
						fullWidth
						iconLeft={CreditCard}
						onPress={() => {
							void handleCardCheckout();
						}}
						loading={userCreateCardSession.isPending || isPollingForCard}
					>
						{isPollingForCard
							? t("detail.finalize.waitingForCard")
							: t("detail.finalize.payWithCard")}
					</Button>
					<Button
						variant="secondary"
						size="lg"
						fullWidth
						iconLeft={Wallet}
						onPress={handleSwitchToCash}
						loading={userSwitchToCash.isPending}
					>
						{t("detail.finalize.payCashInstead")}
					</Button>
				</View>
			) : (
				<View
					style={{
						borderRadius: radius.card,
						padding: space[3],
						flexDirection: "row",
						alignItems: "center",
						gap: space[2],
						backgroundColor: themeColors.surfaceElevated,
					}}
				>
					<CreditCard
						size={spacing.icon.xs}
						color={themeColors.textMuted}
						strokeWidth={2.2}
					/>
					<Text
						variant="bodySm"
						style={{ color: themeColors.textMuted, flex: 1 }}
					>
						{t("detail.finalize.awaitingCardTech")}
					</Text>
				</View>
			)}

			<TechnicianProfileSheet ref={profileSheetRef} />
			<CustomerInfoSheet ref={customerSheetRef} />
		</View>
	);
}
