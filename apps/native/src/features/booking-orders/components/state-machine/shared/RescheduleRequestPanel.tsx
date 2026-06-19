import { CalendarClock, Check, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { confirm } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import {
	radius,
	space,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import {
	useOrderRescheduleQuery,
	useTechApproveReschedule,
	useTechRejectReschedule,
	useTechWithdrawReschedule,
	useUserApproveReschedule,
	useUserRejectReschedule,
	useUserWithdrawReschedule,
} from "@/src/features/booking-orders/hooks";
import {
	formatTime,
	getDateLocale,
} from "@/src/features/booking-orders/utils/booking-helpers";
import {
	extractOrderErrorToken,
	translateOrderError,
} from "@/src/features/booking-orders/utils/translate-order-error";
import { logger } from "@/src/lib/logger";

export type ReschedulePanelViewer = "user" | "technician";

interface Props {
	readonly orderId: string;
	readonly viewer: ReschedulePanelViewer;
	readonly forceVisible?: boolean;
}

function formatDate(iso: string, language?: string): string {
	const d = new Date(`${iso}T00:00:00`);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(getDateLocale(language), {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatDateTime(
	dateIso: string,
	startAtIso: string | null | undefined,
	language?: string,
): string {
	const date = formatDate(dateIso, language);
	const time = formatTime(startAtIso, language);
	return time ? `${date} • ${time}` : date;
}

function useCountdownMs(targetIso: string | null): number | null {
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		if (!targetIso) return;
		const id = setInterval(() => setNow(Date.now()), 30_000);
		return () => clearInterval(id);
	}, [targetIso]);

	return useMemo(() => {
		if (!targetIso) return null;
		const ms = new Date(targetIso).getTime() - now;
		if (Number.isNaN(ms)) return null;
		return ms;
	}, [now, targetIso]);
}

export default function RescheduleRequestPanel({
	orderId,
	viewer,
	forceVisible = false,
}: Props) {
	const { t, i18n } = useTranslation("orders");
	const themeColors = useThemeColors();
	const { data, isLoading } = useOrderRescheduleQuery(orderId, viewer);

	const userApprove = useUserApproveReschedule();
	const userReject = useUserRejectReschedule();
	const userWithdraw = useUserWithdrawReschedule();
	const techApprove = useTechApproveReschedule();
	const techReject = useTechRejectReschedule();
	const techWithdraw = useTechWithdrawReschedule();

	const approveMutation = viewer === "technician" ? techApprove : userApprove;
	const rejectMutation = viewer === "technician" ? techReject : userReject;
	const withdrawMutation =
		viewer === "technician" ? techWithdraw : userWithdraw;

	const request = data && data.resolution === "pending" ? data : null;

	const expiresAtIso = useMemo(() => {
		if (!request) return null;
		const createdMs = new Date(request.created_at).getTime();
		if (Number.isNaN(createdMs)) return null;
		return new Date(
			createdMs + request.response_window_hours * 3_600_000,
		).toISOString();
	}, [request]);

	const countdownMs = useCountdownMs(expiresAtIso);
	const countdown = useMemo(() => {
		if (countdownMs == null) return null;
		if (countdownMs <= 0) return t("detail.reschedule.countdownExpired");
		const h = Math.floor(countdownMs / 3_600_000);
		const m = Math.floor((countdownMs % 3_600_000) / 60_000);
		return h <= 0
			? t("detail.reschedule.countdownMinutes", { m })
			: t("detail.reschedule.countdownHours", { h, m });
	}, [countdownMs, t]);

	const isRequester = request ? request.requested_by === viewer : false;
	const isCounterparty = request ? request.requested_by !== viewer : false;
	const isResolving =
		approveMutation.isPending ||
		rejectMutation.isPending ||
		withdrawMutation.isPending;

	const handleApprove = useCallback(() => {
		approveMutation.mutate(
			{ orderId },
			{
				onSuccess: () =>
					Toast.show({
						type: "success",
						text1: t("detail.reschedule.toastApproved"),
					}),
				onError: (err) => {
					logger.warn("booking.reschedule", "approve_failed", {
						orderId,
						viewer,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: t("detail.reschedule.toastApproveFailed"),
						text2: translateOrderError(err),
					});
				},
			},
		);
	}, [approveMutation, orderId, viewer, t]);

	const handleReject = useCallback(async () => {
		const ok = await confirm({
			title: t("detail.reschedule.declineTitle"),
			description: t("detail.reschedule.declineBody"),
			primary: { label: t("detail.reschedule.decline"), destructive: true },
			secondary: { label: t("detail.reschedule.keepRequest") },
		});
		if (!ok) return;
		rejectMutation.mutate(
			{ orderId, reason: t("detail.reschedule.declinedReason") },
			{
				onSuccess: () =>
					Toast.show({
						type: "success",
						text1: t("detail.reschedule.toastRejected"),
					}),
				onError: (err) => {
					logger.warn("booking.reschedule", "reject_failed", {
						orderId,
						viewer,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: t("detail.reschedule.toastRejectFailed"),
						text2: translateOrderError(err),
					});
				},
			},
		);
	}, [rejectMutation, orderId, viewer, t]);

	const handleWithdraw = useCallback(() => {
		withdrawMutation.mutate(
			{ orderId },
			{
				onSuccess: () =>
					Toast.show({
						type: "success",
						text1: t("detail.reschedule.toastWithdrawn"),
					}),
				onError: (err) => {
					logger.warn("booking.reschedule", "withdraw_failed", {
						orderId,
						viewer,
						token: extractOrderErrorToken(err),
					});
					Toast.show({
						type: "info",
						text1: t("detail.reschedule.toastWithdrawFailed"),
						text2: translateOrderError(err),
					});
				},
			},
		);
	}, [withdrawMutation, orderId, viewer, t]);

	if (isLoading && !data) {
		return (
			<View
				style={{
					padding: space[4],
					borderRadius: radius.card,
					backgroundColor: themeColors.surfaceElevated,
					flexDirection: "row",
					alignItems: "center",
					gap: space[3],
				}}
			>
				<ActivityIndicator size="small" color={themeColors.primary} />
				<View style={{ flex: 1, gap: space[1] }}>
					<Text
						variant="buttonMd"
						className="font-google-sans-bold"
						style={{ color: themeColors.textPrimary }}
					>
						{t("detail.reschedule.checkingTitle")}
					</Text>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{t("detail.reschedule.checkingBody")}
					</Text>
				</View>
			</View>
		);
	}

	if (!request) {
		if (!forceVisible) return null;
		return (
			<View
				style={{
					padding: space[4],
					borderRadius: radius.card,
					backgroundColor: themeColors.surfaceElevated,
					flexDirection: "row",
					alignItems: "center",
					gap: space[3],
				}}
			>
				<ActivityIndicator size="small" color={themeColors.primary} />
				<View style={{ flex: 1, gap: space[1] }}>
					<Text
						variant="buttonMd"
						className="font-google-sans-bold"
						style={{ color: themeColors.textPrimary }}
					>
						{t("detail.reschedule.loadingTitle")}
					</Text>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{t("detail.reschedule.loadingBody")}
					</Text>
				</View>
			</View>
		);
	}

	const eyebrow = isRequester
		? t("detail.reschedule.eyebrowYou")
		: viewer === "user"
			? t("detail.reschedule.eyebrowTech")
			: t("detail.reschedule.eyebrowCustomer");

	return (
		<View
			style={{
				gap: space[3],
				padding: space[4],
				borderRadius: radius.card,
				backgroundColor: themeColors.surfaceElevated,
				opacity: isResolving ? 0.82 : 1,
			}}
		>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: space[3],
				}}
			>
				<View
					style={{
						width: 40,
						height: 40,
						borderRadius: radius.pill,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: `${themeColors.primary}1A`,
					}}
				>
					<CalendarClock
						size={spacing.icon.sm}
						color={themeColors.primary}
						strokeWidth={2}
					/>
				</View>
				<View style={{ flex: 1, gap: space[1] }}>
					<Text
						variant="caption"
						className="font-google-sans-bold uppercase"
						style={{ color: themeColors.textMuted, letterSpacing: 0.6 }}
					>
						{eyebrow}
					</Text>
					<Text
						variant="buttonMd"
						className="font-google-sans-bold"
						style={{ color: themeColors.textPrimary }}
					>
						{t("detail.reschedule.requestedDate", {
							value: formatDateTime(
								request.proposed_scheduled_date,
								request.proposed_scheduled_start_at,
								i18n.language,
							),
						})}
					</Text>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{isCounterparty
							? t("detail.reschedule.counterpartyHint")
							: t("detail.reschedule.requesterHint")}
					</Text>
				</View>
				{countdown ? (
					<View
						style={{
							paddingHorizontal: space[2],
							paddingVertical: 2,
							borderRadius: radius.pill,
							backgroundColor: `${themeColors.primary}1A`,
						}}
					>
						<Text variant="caption" style={{ color: themeColors.primary }}>
							{countdown}
						</Text>
					</View>
				) : null}
			</View>

			<View
				style={{
					borderTopWidth: 1,
					borderTopColor: themeColors.borderDefault,
					paddingTop: space[3],
					gap: space[2],
				}}
			>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						gap: space[3],
					}}
				>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{t("detail.reschedule.original")}
					</Text>
					<Text
						variant="bodySm"
						style={{
							color: themeColors.textPrimary,
							flex: 1,
							textAlign: "right",
						}}
					>
						{formatDateTime(
							request.original_scheduled_date,
							request.original_scheduled_start_at,
							i18n.language,
						)}
					</Text>
				</View>
				<View style={{ gap: space[1] }}>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{t("detail.reschedule.reason")}
					</Text>
					<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
						{request.request_reason}
					</Text>
				</View>
			</View>

			{isCounterparty ? (
				<View style={{ flexDirection: "row", gap: space[2] }}>
					<View style={{ flex: 1 }}>
						<Button
							variant="primary"
							size="lg"
							fullWidth
							iconLeft={Check}
							onPress={handleApprove}
							loading={approveMutation.isPending}
							disabled={rejectMutation.isPending || withdrawMutation.isPending}
						>
							{approveMutation.isPending
								? t("detail.reschedule.accepting")
								: t("detail.reschedule.accept")}
						</Button>
					</View>
					<View style={{ flex: 1 }}>
						<Button
							variant="destructive"
							size="lg"
							fullWidth
							iconLeft={X}
							onPress={handleReject}
							loading={rejectMutation.isPending}
							disabled={approveMutation.isPending || withdrawMutation.isPending}
						>
							{rejectMutation.isPending
								? t("detail.reschedule.declining")
								: t("detail.reschedule.decline")}
						</Button>
					</View>
				</View>
			) : (
				<Button
					variant="secondary"
					size="lg"
					fullWidth
					iconLeft={X}
					onPress={handleWithdraw}
					loading={withdrawMutation.isPending}
					disabled={approveMutation.isPending || rejectMutation.isPending}
				>
					{withdrawMutation.isPending
						? t("detail.reschedule.cancelling")
						: t("detail.reschedule.cancelRequest")}
				</Button>
			)}
		</View>
	);
}
