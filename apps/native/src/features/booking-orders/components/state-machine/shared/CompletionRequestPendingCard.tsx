// Phase 4d Plan 02 — CompletionRequestPendingCard.
//
// Shared banner used by both user + tech WorkInProgress views once one side
// has tapped "Mark work complete". Mounts a 20s countdown anchored on the
// server-side `*_completed_at` timestamp so the timer stays in sync between
// devices. When the timer hits zero we auto-fire `onDecline` exactly once.

import { CheckCircle2, Clock, X } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import { Button } from "@/src/components/ui/button";
import { confirm } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import { radius, spacing, useThemeColors } from "@/src/constants/design-tokens";

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
	const { t } = useTranslation("orders");
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
		? t("detail.completion.waitingTitle")
		: t("detail.completion.markedTitle", { actor: actorLabel });

	const description = isWaitingForOther
		? t("detail.completion.waitingBody", { actor: actorLabel })
		: t("detail.completion.confirmBody");

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
								{t("detail.completion.seconds", { n: secondsLeft })}
							</Text>
						</View>
					</View>
					<Text variant="bodySm" style={{ color: themeColors.textSecondary }}>
						{description}
					</Text>
				</View>
			</View>

			{isWaitingForOther ? (
				<Button
					variant="secondary"
					size="lg"
					fullWidth
					iconLeft={X}
					onPress={onDecline}
					loading={declinePending}
				>
					{t("detail.completion.cancelRequest")}
				</Button>
			) : (
				<View style={{ gap: spacing.stack.sm }}>
					<Button
						variant="primary"
						size="lg"
						fullWidth
						iconLeft={CheckCircle2}
						onPress={onConfirm}
						loading={confirmPending}
					>
						{t("detail.completion.confirmComplete")}
					</Button>
					<Button
						variant="destructive"
						size="lg"
						fullWidth
						onPress={async () => {
							const ok = await confirm({
								title: t("detail.completion.declineTitle"),
								description: t("detail.completion.declineBody"),
								primary: {
									label: t("detail.completion.decline"),
									destructive: true,
								},
								secondary: { label: t("detail.completion.keepRequest") },
							});
							if (!ok) return;
							onDecline();
						}}
						loading={declinePending}
					>
						{t("detail.completion.decline")}
					</Button>
				</View>
			)}
		</View>
	);

	if (reducedMotion) return card;

	return (
		<Animated.View entering={FadeInDown.duration(380)}>{card}</Animated.View>
	);
}
