import { Check, CheckCircle2, Circle, Wallet } from "lucide-react-native";
import { useRef } from "react";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import { formatAmount } from "@/src/lib/helpers/format-currency";
import OrderInfoCompact from "./OrderInfoCompact";
import StageHero from "./StageHero";
import { StagePrimaryAction } from "./StageAction";
import {
	useTechMarkCashReceived,
	useUserCheckout,
} from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import CustomerInfoSheet, {
	type CustomerInfoSheetHandle,
} from "./CustomerInfoSheet";
import {
	DUR_STAGGER,
	STAGGER_GAP,
} from "@/src/lib/animation/constants";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";

export type SummaryViewer = "user" | "technician";

interface Props {
	readonly order: Order;
	readonly viewer: SummaryViewer;
}

interface TimelineRow {
	label: string;
	timestamp: string | null;
}

function formatTimestamp(value: string | null | undefined): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function OrderSummaryFinalize({ order, viewer }: Props) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const userCheckout = useUserCheckout();
	const techMarkCash = useTechMarkCashReceived();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);

	const isUser = viewer === "user";
	const booking = order as unknown as TechnicianBooking;
	const userConfirmed = order.user_completed_at != null;
	const techConfirmed = order.technician_completed_at != null;
	const otherConfirmed = isUser ? techConfirmed : userConfirmed;
	const meConfirmed = isUser ? userConfirmed : techConfirmed;

	const handleFinalize = () => {
		const onError = (err: Error) =>
			Toast.show({
				type: "error",
				text1: "Could not finalize",
				text2: err.message,
			});
		if (isUser) {
			userCheckout.mutate({ orderId: order.id, method: "cash" }, { onError });
		} else {
			techMarkCash.mutate({ orderId: order.id }, { onError });
		}
	};

	const finalizePending = isUser
		? userCheckout.isPending
		: techMarkCash.isPending;

	const fadeIn = (i: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(i * STAGGER_GAP).duration(DUR_STAGGER);

	const counterpartyLabel = isUser ? "Technician" : "Customer";
	const workCompletedAt =
		order.user_completed_at && order.technician_completed_at
			? new Date(order.user_completed_at) >
				new Date(order.technician_completed_at)
				? order.user_completed_at
				: order.technician_completed_at
			: order.user_completed_at ?? order.technician_completed_at ?? null;

	const timeline: TimelineRow[] = [
		{ label: "Order placed", timestamp: order.created_at ?? null },
		{ label: "Tech arrived", timestamp: order.arrived_at ?? null },
		{ label: "Work complete", timestamp: workCompletedAt },
	];

	const finalAmount = order.final_price ?? order.estimated_price ?? 0;

	const onIdentityPress = () => {
		if (isUser) {
			profileSheetRef.current?.open(
				order.technician_id,
				getPfpInitialsFallback(order.technician_name),
			);
		} else {
			customerSheetRef.current?.open({
				name: booking.user_name ?? "Customer",
				phone: booking.user_phone ?? null,
				address: booking.user_address ?? null,
				problem: order.problem_description ?? null,
			});
		}
	};

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={CheckCircle2}
				eyebrow="Finalize"
				title="One tap to close out."
				subtitle="Confirm cash handover, then we wrap the order."
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
						className="font-google-sans-bold uppercase"
						style={{
							color: themeColors.onPrimaryHeader,
							opacity: 0.78,
							letterSpacing: 1.1,
						}}
					>
						Final price
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
							EGP
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
							Cash on delivery · in-app payments soon
						</Text>
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
						className="font-google-sans-bold uppercase"
						style={{ color: themeColors.textMuted, letterSpacing: 1 }}
					>
						Timeline
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
								<Circle size={spacing.icon.sm} color={themeColors.borderDefault} />
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
							<Text
								variant="caption"
								style={{ color: themeColors.textMuted }}
							>
								{formatTimestamp(row.timestamp)}
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
							{counterpartyLabel} confirmed. Tap to finalize.
						</Text>
					</View>
				</Animated.View>
			) : null}

			<StagePrimaryAction
				label={
					meConfirmed ? "Waiting on the other side…" : "Mark order completed"
				}
				icon={CheckCircle2}
				onPress={handleFinalize}
				pending={finalizePending}
				disabled={meConfirmed}
			/>

			<TechnicianProfileSheet ref={profileSheetRef} />
			<CustomerInfoSheet ref={customerSheetRef} />
		</View>
	);
}
