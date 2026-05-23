import { CalendarClock, Check, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";
import { Text } from "@/src/components/ui/text";
import {
	useOrderRescheduleQuery,
	useTechApproveReschedule,
	useTechRejectReschedule,
	useTechWithdrawReschedule,
	useUserApproveReschedule,
	useUserRejectReschedule,
	useUserWithdrawReschedule,
} from "@/src/features/booking-orders/hooks";
import { translateOrderError } from "@/src/features/booking-orders/utils/translate-order-error";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";
import { StageSecondaryAction } from "./StageAction";

export type ReschedulePanelViewer = "user" | "technician";

interface Props {
	readonly orderId: string;
	readonly viewer: ReschedulePanelViewer;
	readonly forceVisible?: boolean;
}

function formatDate(iso: string): string {
	const d = new Date(`${iso}T00:00:00`);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function useCountdown(targetIso: string | null): string | null {
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
		if (ms <= 0) return "Expired";
		const h = Math.floor(ms / 3_600_000);
		const m = Math.floor((ms % 3_600_000) / 60_000);
		if (h <= 0) return `${m}m left`;
		return `${h}h ${m}m left`;
	}, [now, targetIso]);
}

export default function RescheduleRequestPanel({
	orderId,
	viewer,
	forceVisible = false,
}: Props) {
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

	const countdown = useCountdown(expiresAtIso);

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
					Toast.show({ type: "success", text1: "Reschedule approved" }),
				onError: (err) =>
					Toast.show({
						type: "error",
						text1: "Approve failed",
						text2: translateOrderError(err),
					}),
			},
		);
	}, [approveMutation, orderId]);

	const handleReject = useCallback(() => {
		rejectMutation.mutate(
			{ orderId, reason: "Declined by counterparty" },
			{
				onSuccess: () =>
					Toast.show({ type: "success", text1: "Reschedule rejected" }),
				onError: (err) =>
					Toast.show({
						type: "error",
						text1: "Reject failed",
						text2: translateOrderError(err),
					}),
			},
		);
	}, [rejectMutation, orderId]);

	const handleWithdraw = useCallback(() => {
		withdrawMutation.mutate(
			{ orderId },
			{
				onSuccess: () =>
					Toast.show({ type: "success", text1: "Request withdrawn" }),
				onError: (err) =>
					Toast.show({
						type: "error",
						text1: "Withdraw failed",
						text2: translateOrderError(err),
					}),
			},
		);
	}, [withdrawMutation, orderId]);

	if (isLoading && !data) {
		return (
			<View
				style={{
					padding: space[4],
					borderRadius: radius.card,
					backgroundColor: themeColors.surfaceElevated,
					borderWidth: 1,
					borderColor: themeColors.borderDefault,
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
						Checking reschedule request
					</Text>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						Loading the latest request status...
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
					borderWidth: 1,
					borderColor: themeColors.borderDefault,
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
						Loading reschedule request
					</Text>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						Fetching the accept, decline, and cancel controls...
					</Text>
				</View>
			</View>
		);
	}

	const eyebrow = isRequester
		? "You requested a reschedule"
		: viewer === "user"
			? "Technician requested a reschedule"
			: "Customer requested a reschedule";

	return (
		<View
			style={{
				gap: space[3],
				padding: space[4],
				borderRadius: radius.card,
				backgroundColor: themeColors.surfaceElevated,
				borderWidth: 1,
				borderColor: isCounterparty
					? `${themeColors.success}55`
					: `${themeColors.primary}33`,
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
						Requested date: {formatDate(request.proposed_scheduled_date)}
					</Text>
					<Text variant="caption" style={{ color: themeColors.textMuted }}>
						{isCounterparty
							? "Accept to move the order, or decline to keep the original date."
							: "Waiting for the other side. You can cancel this request."}
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
						<Text
							variant="caption"
							style={{ color: themeColors.primary }}
						>
							{countdown}
						</Text>
					</View>
				) : null}
			</View>

			<View
				style={{
					padding: space[3],
					borderRadius: radius.button,
					backgroundColor: themeColors.surfaceBase,
					gap: space[1],
				}}
			>
				<Text
					variant="caption"
					className="uppercase"
					style={{ color: themeColors.textMuted, letterSpacing: 0.6 }}
				>
					Original
				</Text>
				<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
					{formatDate(request.original_scheduled_date)}
				</Text>
				<View
					style={{
						height: 1,
						backgroundColor: themeColors.borderDefault,
						marginVertical: space[2],
					}}
				/>
				<Text
					variant="caption"
					className="uppercase"
					style={{ color: themeColors.textMuted, letterSpacing: 0.6 }}
				>
					Reason
				</Text>
				<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
					{request.request_reason}
				</Text>
			</View>

			{isCounterparty ? (
				<View style={{ flexDirection: "row", gap: space[2] }}>
					<View style={{ flex: 1 }}>
						<StageSecondaryAction
							label="Accept"
							pendingLabel="Accepting..."
							icon={Check}
							tone="success"
							onPress={handleApprove}
							pending={approveMutation.isPending}
							disabled={rejectMutation.isPending || withdrawMutation.isPending}
						/>
					</View>
					<View style={{ flex: 1 }}>
						<StageSecondaryAction
							label="Decline"
							pendingLabel="Declining..."
							icon={X}
							tone="danger"
							onPress={handleReject}
							pending={rejectMutation.isPending}
							disabled={approveMutation.isPending || withdrawMutation.isPending}
						/>
					</View>
				</View>
			) : (
				<StageSecondaryAction
					label="Cancel request"
					pendingLabel="Cancelling..."
					icon={X}
					onPress={handleWithdraw}
					disabled={approveMutation.isPending || rejectMutation.isPending}
					pending={withdrawMutation.isPending}
				/>
			)}
		</View>
	);
}
