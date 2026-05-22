// Phase 4d Plan 02 — CompletionRequestPendingCard.
//
// Shared banner used by both user + tech WorkInProgress views once one side
// has tapped "Mark work complete". Mounts a 20s countdown anchored on the
// server-side `*_completed_at` timestamp so the timer stays in sync between
// devices. When the timer hits zero we auto-fire `onDecline` exactly once.

import { CheckCircle2, Clock, X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { radius, spacing, useThemeColors } from "@/src/lib/theme";

export type CompletionPendingDirection = "awaiting_me" | "awaiting_them";

interface Props {
	readonly direction: CompletionPendingDirection;
	readonly actorLabel: string;
	readonly requestedAt: string | null;
	readonly timerSeconds?: number;
	readonly onConfirm?: () => void;
	readonly onDecline: () => void;
	readonly confirmPending?: boolean;
	readonly declinePending?: boolean;
}

const DEFAULT_WINDOW_SECONDS = 20;
const TICK_INTERVAL_MS = 500;

export default function CompletionRequestPendingCard({
	direction,
	actorLabel,
	requestedAt,
	timerSeconds = DEFAULT_WINDOW_SECONDS,
	onConfirm,
	onDecline,
	confirmPending = false,
	declinePending = false,
}: Props) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();

	const expiresAtMs = useMemo(() => {
		if (!requestedAt) return Date.now() + timerSeconds * 1000;
		return new Date(requestedAt).getTime() + timerSeconds * 1000;
	}, [requestedAt, timerSeconds]);

	const [secondsLeft, setSecondsLeft] = useState<number>(() =>
		Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)),
	);
	const firedRef = useRef(false);
	const onDeclineRef = useRef(onDecline);
	useEffect(() => {
		onDeclineRef.current = onDecline;
	}, [onDecline]);

	useEffect(() => {
		firedRef.current = false;
		const tick = () => {
			const remainingMs = expiresAtMs - Date.now();
			const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
			setSecondsLeft((prev) => (prev === seconds ? prev : seconds));
			if (remainingMs <= 0 && !firedRef.current) {
				firedRef.current = true;
				onDeclineRef.current();
			}
		};
		tick();
		const id = setInterval(tick, TICK_INTERVAL_MS);
		return () => clearInterval(id);
	}, [expiresAtMs]);

	const isWaitingForOther = direction === "awaiting_them";

	const title = isWaitingForOther
		? "Waiting for confirmation"
		: `${actorLabel} marked the job complete`;

	const description = isWaitingForOther
		? `Hold on while ${actorLabel.toLowerCase()} confirms the work is done.`
		: "Confirm only if the work has actually been finished — otherwise tap Decline.";

	const card = (
		<View
			style={{
				borderRadius: radius.card,
				backgroundColor: themeColors.surfaceElevated,
				padding: spacing.card.padding,
				gap: spacing.stack.md,
			}}
		>
			<View style={{ flexDirection: "row", gap: spacing.stack.md }}>
				<View
					style={{
						width: spacing.control.iconBoxTouch.size,
						height: spacing.control.iconBoxTouch.size,
						borderRadius: radius.pill,
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: isWaitingForOther
							? themeColors.primaryLight
							: themeColors.warningLight,
					}}
				>
					{isWaitingForOther ? (
						<Clock size={spacing.icon.sm} color={themeColors.primary} />
					) : (
						<CheckCircle2
							size={spacing.icon.sm}
							color={themeColors.warning}
						/>
					)}
				</View>

				<View style={{ flex: 1, gap: spacing.stack.xs }}>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							gap: spacing.stack.sm,
						}}
					>
						<Text
							variant="buttonMd"
							style={{ color: themeColors.textPrimary, flex: 1 }}
						>
							{title}
						</Text>
						<View
							style={{
								paddingHorizontal: spacing.stack.md,
								paddingVertical: spacing.stack.xs,
								borderRadius: radius.pill,
								backgroundColor: isWaitingForOther
									? themeColors.primary
									: themeColors.warning,
							}}
						>
							<Text
								variant="caption"
								style={{
									color: themeColors.onPrimaryHeader,
									fontVariant: ["tabular-nums"],
								}}
							>
								{secondsLeft}s
							</Text>
						</View>
					</View>
					<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
						{description}
					</Text>
				</View>
			</View>

			{isWaitingForOther ? (
				<TouchableOpacity
					onPress={onDecline}
					disabled={declinePending}
					activeOpacity={0.8}
					style={{
						alignItems: "center",
						justifyContent: "center",
						minHeight: 44,
						paddingVertical: spacing.stack.md,
						borderRadius: radius.button,
						borderWidth: 1,
						borderColor: themeColors.borderDefault,
						backgroundColor: themeColors.surfaceBase,
						flexDirection: "row",
						gap: spacing.stack.sm,
					}}
				>
					{declinePending ? (
						<ActivityIndicator size="small" color={themeColors.textSecondary} />
					) : (
						<>
							<X
								size={spacing.icon.xs}
								color={themeColors.textSecondary}
							/>
							<Text
								variant="buttonMd"
								style={{ color: themeColors.textSecondary }}
							>
								Cancel my request
							</Text>
						</>
					)}
				</TouchableOpacity>
			) : (
				<View style={{ gap: spacing.stack.sm }}>
					<TouchableOpacity
						onPress={onConfirm}
						disabled={confirmPending}
						activeOpacity={0.85}
						style={{
							alignItems: "center",
							justifyContent: "center",
							minHeight: 48,
							paddingVertical: spacing.stack.md,
							borderRadius: radius.button,
							backgroundColor: confirmPending
								? themeColors.borderDefault
								: themeColors.success,
							flexDirection: "row",
							gap: spacing.stack.sm,
						}}
					>
						{confirmPending ? (
							<ActivityIndicator
								size="small"
								color={themeColors.onPrimaryHeader}
							/>
						) : (
							<>
								<CheckCircle2
									size={spacing.icon.sm}
									color={themeColors.onPrimaryHeader}
								/>
								<Text
									variant="buttonLg"
									style={{ color: themeColors.onPrimaryHeader }}
								>
									Confirm complete
								</Text>
							</>
						)}
					</TouchableOpacity>
					<TouchableOpacity
						onPress={onDecline}
						disabled={declinePending}
						activeOpacity={0.85}
						style={{
							alignItems: "center",
							justifyContent: "center",
							minHeight: 48,
							paddingVertical: spacing.stack.md,
							borderRadius: radius.button,
							borderWidth: 1,
							borderColor: themeColors.danger,
							backgroundColor: themeColors.surfaceBase,
						}}
					>
						{declinePending ? (
							<ActivityIndicator size="small" color={themeColors.danger} />
						) : (
							<Text variant="buttonMd" style={{ color: themeColors.danger }}>
								Decline
							</Text>
						)}
					</TouchableOpacity>
				</View>
			)}
		</View>
	);

	if (reducedMotion) return card;

	return (
		<Animated.View entering={FadeInDown.duration(380)}>{card}</Animated.View>
	);
}
