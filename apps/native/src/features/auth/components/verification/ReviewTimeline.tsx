import { Check } from "lucide-react-native";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	Easing,
	interpolateColor,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	DUR_PULSE_OUT,
	DUR_REVEAL,
	EASE_OUT_EXPO,
	PULSE_SCALE_MAX,
} from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";

const RAIL_WIDTH = 32;
const DOT = 18;
const ROW_GAP = 22;

type TimelinePhase = "reviewing" | "approved";

interface ReviewTimelineProps {
	readonly phase: TimelinePhase;
}

/**
 * The verification screen's structural spine. While `reviewing`, the cyan
 * "Under review" node pulses (the one live element). When `phase` flips to
 * `approved`, that node completes to brand and the "Approved" node lights up
 * success with a one-shot celebratory ring — a single `progress` value drives
 * the whole transition so it reads as one motion.
 */
export function ReviewTimeline({ phase }: ReviewTimelineProps) {
	const { t } = useTranslation("auth");
	const c = useThemeColors();
	const reducedMotion = useReducedMotion();
	const approved = phase === "approved";

	const progress = useSharedValue(approved ? 1 : 0);
	const pulse = useSharedValue(0);
	const celebrate = useSharedValue(approved ? 1 : 0);

	useEffect(() => {
		if (reducedMotion) {
			progress.value = approved ? 1 : 0;
			return;
		}
		progress.value = withTiming(approved ? 1 : 0, {
			duration: DUR_REVEAL,
			easing: EASE_OUT_EXPO,
		});
	}, [approved, reducedMotion, progress]);

	useEffect(() => {
		if (reducedMotion) return;
		pulse.value = withRepeat(
			withTiming(1, {
				duration: DUR_PULSE_OUT,
				easing: Easing.out(Easing.ease),
			}),
			-1,
			false,
		);
	}, [reducedMotion, pulse]);

	useEffect(() => {
		if (!approved || reducedMotion) return;
		celebrate.value = 0;
		celebrate.value = withTiming(1, {
			duration: DUR_PULSE_OUT,
			easing: Easing.out(Easing.ease),
		});
	}, [approved, reducedMotion, celebrate]);

	// Node 1 (Under review): sonar ring fades as we approve; dot colour shifts
	// cyan → brand; a check scales in once complete.
	const reviewRingStyle = useAnimatedStyle(() => ({
		transform: [{ scale: 1 + pulse.value * (PULSE_SCALE_MAX - 1) }],
		opacity: 0.4 * (1 - pulse.value) * (1 - progress.value),
	}));
	const reviewDotStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(
			progress.value,
			[0, 1],
			[c.accentCyan, c.primary],
		),
	}));
	const reviewCheckStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ scale: 0.5 + 0.5 * progress.value }],
	}));

	// Connector 1 → 2 lights up (opacity crossfade, no layout animation).
	const connectorFillStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
	}));

	// Node 2 (Approved): success fill pops in + one-shot celebratory ring.
	const approvedFillStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ scale: progress.value }],
	}));
	const celebrateRingStyle = useAnimatedStyle(() => ({
		transform: [{ scale: 1 + celebrate.value * (PULSE_SCALE_MAX - 1) }],
		opacity: 0.5 * (1 - celebrate.value),
	}));

	return (
		<View>
			{/* Node 0 — Submitted (always complete) */}
			<View style={{ flexDirection: "row" }}>
				<View style={{ width: RAIL_WIDTH, alignItems: "center" }}>
					<View
						style={{
							position: "absolute",
							top: DOT,
							bottom: 0,
							width: 2,
							borderRadius: 1,
							backgroundColor: c.primary,
						}}
					/>
					<DoneDot color={c.primary} checkColor={c.surfaceOnPrimary} />
				</View>
				<RowText
					title={t("verification.timeline.submitted")}
					titleColor={c.textPrimary}
					subtitle={t("verification.timeline.submittedSubtitle")}
				/>
			</View>

			{/* Node 1 — Under review → Reviewed */}
			<View style={{ flexDirection: "row" }}>
				<View style={{ width: RAIL_WIDTH, alignItems: "center" }}>
					{/* base muted connector + brand fill that lights up */}
					<View
						style={{
							position: "absolute",
							top: DOT,
							bottom: 0,
							width: 2,
							borderRadius: 1,
							backgroundColor: c.borderDefault,
						}}
					/>
					<Animated.View
						style={[
							{
								position: "absolute",
								top: DOT,
								bottom: 0,
								width: 2,
								borderRadius: 1,
								backgroundColor: c.primary,
							},
							connectorFillStyle,
						]}
					/>

					<Animated.View
						pointerEvents="none"
						style={[
							{
								position: "absolute",
								top: 0,
								width: DOT,
								height: DOT,
								borderRadius: DOT / 2,
								backgroundColor: c.accentCyan,
							},
							reviewRingStyle,
						]}
					/>
					<Animated.View
						style={[
							{
								width: DOT,
								height: DOT,
								borderRadius: DOT / 2,
								borderWidth: 3,
								borderColor: c.surfaceBase,
								alignItems: "center",
								justifyContent: "center",
							},
							reviewDotStyle,
						]}
					>
						<Animated.View style={reviewCheckStyle}>
							<Check size={10} color={c.surfaceOnPrimary} strokeWidth={3} />
						</Animated.View>
					</Animated.View>
				</View>
				<RowText
					title={
						approved
							? t("verification.timeline.reviewed")
							: t("verification.timeline.underReview")
					}
					titleColor={approved ? c.textPrimary : c.accentCyan}
					subtitle={
						approved
							? t("verification.timeline.reviewedSubtitle")
							: t("verification.timeline.underReviewSubtitle")
					}
				/>
			</View>

			{/* Node 2 — Approved */}
			<View style={{ flexDirection: "row" }}>
				<View style={{ width: RAIL_WIDTH, alignItems: "center" }}>
					<Animated.View
						pointerEvents="none"
						style={[
							{
								position: "absolute",
								top: 0,
								width: DOT,
								height: DOT,
								borderRadius: DOT / 2,
								backgroundColor: c.success,
							},
							celebrateRingStyle,
						]}
					/>
					{/* hollow base */}
					<View
						style={{
							width: DOT,
							height: DOT,
							borderRadius: DOT / 2,
							borderWidth: 2,
							borderColor: c.borderDefault,
							backgroundColor: c.surfaceBase,
						}}
					/>
					{/* success fill pops over the hollow base */}
					<Animated.View
						style={[
							{
								position: "absolute",
								top: 0,
								width: DOT,
								height: DOT,
								borderRadius: DOT / 2,
								backgroundColor: c.success,
								alignItems: "center",
								justifyContent: "center",
							},
							approvedFillStyle,
						]}
					>
						<Check size={11} color={c.surfaceOnPrimary} strokeWidth={3} />
					</Animated.View>
				</View>
				<RowText
					title={t("verification.timeline.approved")}
					titleColor={approved ? c.success : c.textMuted}
					subtitle={
						approved
							? t("verification.timeline.approvedSubtitle")
							: t("verification.timeline.approvalPendingSubtitle")
					}
					isLast
				/>
			</View>
		</View>
	);
}

function DoneDot({
	color,
	checkColor,
}: {
	readonly color: string;
	readonly checkColor: string;
}) {
	return (
		<View
			style={{
				width: DOT,
				height: DOT,
				borderRadius: DOT / 2,
				backgroundColor: color,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Check size={11} color={checkColor} strokeWidth={3} />
		</View>
	);
}

function RowText({
	title,
	titleColor,
	subtitle,
	isLast = false,
}: {
	readonly title: string;
	readonly titleColor: string;
	readonly subtitle: string;
	readonly isLast?: boolean;
}) {
	return (
		<View style={{ flex: 1, paddingBottom: isLast ? 0 : ROW_GAP }}>
			<Text
				variant="bodySm"
				className="font-google-sans-semibold"
				style={{ color: titleColor }}
			>
				{title}
			</Text>
			<Text
				variant="caption"
				className="text-content-muted"
				style={{ marginTop: 2 }}
			>
				{subtitle}
			</Text>
		</View>
	);
}
