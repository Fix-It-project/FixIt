// Read-only terminal summary (completed / cancelled).
//
// Reached from history + any finished-order card via `routeToOrder`. Unlike the
// live `[orderId]` / `[bookingId]` detail screens, this has no lifecycle CTAs —
// just a back button, the final price breakdown, the people + order details, a
// timeline, and (completed user, not yet reviewed) the inline review form.

import { Check, CheckCircle2, Circle, XCircle } from "lucide-react-native";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import InlineReviewForm, {
	type InlineReviewFormHandle,
} from "@/src/components/reviews/InlineReviewForm";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { getDateLocale } from "@/src/features/booking-orders/utils/booking-helpers";
import { formatAmount } from "@/src/features/booking-orders/utils/format-currency";
import { ReportProblemEntry } from "@/src/features/reports/components/ReportProblemEntry";
import { showError } from "@/src/lib/errors";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import OrderInfoCompact from "./OrderInfoCompact";

interface Props {
	readonly order: Order;
	readonly viewer: "user" | "technician";
	readonly onBack: () => void;
}

function formatTimestamp(
	value: string | null | undefined,
	lang?: string,
): string {
	if (!value) return "—";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "—";
	return d.toLocaleString(getDateLocale(lang), {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function OrderSummaryScreen({ order, viewer, onBack }: Props) {
	const { t, i18n } = useTranslation("orders");
	const { t: tReviews } = useTranslation("reviews");
	const themeColors = useThemeColors();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const reviewFormRef = useRef<InlineReviewFormHandle>(null);
	const [rating, setRating] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [submittedReview, setSubmittedReview] = useState(false);

	const isUser = viewer === "user";
	const isCompleted = order.status === "completed";
	const accent = isCompleted ? themeColors.success : themeColors.danger;

	// `Order` carries `technician_name`; the customer name lives on the wider
	// `TechnicianBooking` shape the tech route casts in. Mirror OrderSummaryFinalize.
	const booking = order as unknown as TechnicianBooking;
	const counterpartyName = isUser ? order.technician_name : booking.user_name;

	const handleSubmitReview = async () => {
		setSubmitting(true);
		try {
			const result = await reviewFormRef.current?.submit();
			if (result?.submitted) setRating(0);
		} finally {
			setSubmitting(false);
		}
	};

	const inspectionFee = order.inspection_fee ?? 0;
	const workAmount =
		order.work_price ?? order.estimated_price ?? order.final_price ?? 0;
	const finalAmount = order.final_price ?? workAmount + inspectionFee;

	const workCompletedAt =
		order.user_completed_at && order.technician_completed_at
			? new Date(order.user_completed_at) >
				new Date(order.technician_completed_at)
				? order.user_completed_at
				: order.technician_completed_at
			: (order.user_completed_at ?? order.technician_completed_at ?? null);

	const timeline = [
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

	const showReviewForm =
		isUser && isCompleted && !order.has_review && !submittedReview;

	return (
		<ScreenSafeAreaView edges={["top"]} className="flex-1 bg-surface">
			<PageHeader
				title={t("detail.summary.title")}
				subtitle={
					isCompleted
						? t("detail.summary.completedSubtitle")
						: t("detail.summary.cancelledSubtitle")
				}
				variant="surface"
				onBackPress={onBack}
			/>
			<ScrollView
				className="flex-1"
				bounces={false}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: space[4],
					paddingTop: space[3],
					paddingBottom: space[10],
					gap: space[5],
				}}
			>
				{/* Status banner */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: space[2],
						padding: space[4],
						borderRadius: radius.card,
						backgroundColor: `${accent}14`,
					}}
				>
					{isCompleted ? (
						<CheckCircle2
							size={spacing.icon.sm}
							color={accent}
							strokeWidth={2.4}
						/>
					) : (
						<XCircle size={spacing.icon.sm} color={accent} strokeWidth={2.4} />
					)}
					<View style={{ flex: 1, gap: space[1] }}>
						<Text
							variant="bodySm"
							className="font-google-sans-bold"
							style={{ color: accent }}
						>
							{isCompleted
								? t("detail.summary.completedTitle")
								: t("detail.summary.cancelledTitle")}
						</Text>
						{isCompleted ? (
							<Text variant="h3" className="font-google-sans-bold text-content">
								{formatAmount(finalAmount)} {t("detail.finalize.currency")}
							</Text>
						) : null}
					</View>
				</View>

				{/* Price breakdown — completed only */}
				{isCompleted ? (
					<View
						style={{
							borderRadius: radius.card,
							backgroundColor: themeColors.surfaceElevated,
							padding: space[4],
							gap: space[2],
						}}
					>
						<View className="flex-row items-center justify-between">
							<Text
								variant="bodySm"
								style={{ color: themeColors.textSecondary }}
							>
								{t("detail.finalize.workPrice")}
							</Text>
							<Text
								variant="bodySm"
								className="font-google-sans-bold"
								style={{ color: themeColors.textPrimary }}
							>
								{formatAmount(workAmount)} {t("detail.finalize.currency")}
							</Text>
						</View>
						<View className="flex-row items-center justify-between">
							<Text
								variant="bodySm"
								style={{ color: themeColors.textSecondary }}
							>
								{t("detail.finalize.inspectionFee")}
							</Text>
							<Text
								variant="bodySm"
								className="font-google-sans-bold"
								style={{ color: themeColors.textPrimary }}
							>
								{formatAmount(inspectionFee)} {t("detail.finalize.currency")}
							</Text>
						</View>
						<View
							style={{
								height: 1,
								backgroundColor: themeColors.borderDefault,
								opacity: 0.5,
							}}
						/>
						<View className="flex-row items-center justify-between">
							<Text
								variant="bodySm"
								className="font-google-sans-bold"
								style={{ color: themeColors.textPrimary }}
							>
								{t("detail.finalize.totalPayable")}
							</Text>
							<Text
								variant="body"
								className="font-google-sans-bold"
								style={{ color: themeColors.primary }}
							>
								{formatAmount(finalAmount)} {t("detail.finalize.currency")}
							</Text>
						</View>
					</View>
				) : null}

				<OrderInfoCompact
					order={order}
					viewer={viewer}
					onIdentityPress={
						isUser
							? () =>
									profileSheetRef.current?.open(
										order.technician_id,
										getPfpInitialsFallback(order.technician_name),
									)
							: undefined
					}
					footer={
						showReviewForm ? (
							<View style={{ gap: space[3] }}>
								<InlineReviewForm
									ref={reviewFormRef}
									orderId={order.id}
									technicianId={order.technician_id}
									technicianName={order.technician_name ?? undefined}
									onRatingChange={setRating}
									onSubmitted={() => {
										setSubmittedReview(true);
										Toast.show({
											type: "success",
											text1: tReviews("submitSuccess"),
										});
									}}
									onError={(err) => showError(err)}
								/>
								<Button
									variant="primary"
									size="lg"
									fullWidth
									disabled={rating < 1}
									loading={submitting}
									onPress={() => {
										void handleSubmitReview();
									}}
								>
									{t("detail.summary.submitReview")}
								</Button>
							</View>
						) : null
					}
				/>

				{/* Cancellation reason */}
				{!isCompleted && order.cancellation_reason ? (
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
							{t("detail.summary.reason")}
						</Text>
						<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
							{order.cancellation_reason}
						</Text>
					</View>
				) : null}

				{/* Timeline */}
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

				<ReportProblemEntry
					orderId={order.id}
					viewer={viewer}
					counterpartyName={counterpartyName}
					hasOpenReport={order.has_open_report}
				/>

				<TechnicianProfileSheet ref={profileSheetRef} />
			</ScrollView>
		</ScreenSafeAreaView>
	);
}
