import { useRouter } from "expo-router";
import { CalendarDays, Check } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	Easing,
	FadeInDown,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Button } from "@/src/components/ui/button";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation";
import { useTodaySchedule } from "../hooks/useTechHomeOrdersQuery";
import {
	ACTIVE_JOB_STATUSES,
	type TechHomeOrder,
} from "../schemas/orders.schema";
import { formatSlotTime } from "../utils/format-time";
import { formatEgp } from "../utils/money";
import { SectionHeader } from "./SectionHeader";

// Fixed row height keeps every node center exactly ROW_H apart, so the rail
// (an absolutely-positioned line behind the rows) threads through all of them.
const ROW_H = 72;
const RAIL_X = 13; // left offset; node column is 28 wide → centers on the rail.

type NodeState = "done" | "active" | "next" | "upcoming" | "missed";

interface TimelineSlot {
	order: TechHomeOrder;
	state: NodeState;
}

function baseState(order: TechHomeOrder, now: number): NodeState {
	if (order.status === "completed") return "done";
	if (ACTIVE_JOB_STATUSES.has(order.status)) return "active";
	// Accepted-but-not-started: past its slot time → missed-ish, else upcoming.
	const start = order.scheduled_start_at
		? new Date(order.scheduled_start_at).getTime()
		: null;
	if (start != null && start < now) return "missed";
	return "upcoming";
}

/**
 * Derives one slot per order plus the "focus" index — the node the rail fills
 * up to. Focus = the live job, else the next upcoming job, else the last node
 * (the day is effectively over). The first upcoming slot is promoted to "next".
 */
function useTimeline(schedule: TechHomeOrder[]): {
	slots: TimelineSlot[];
	focusIndex: number;
} {
	return useMemo(() => {
		const now = Date.now();
		const slots: TimelineSlot[] = schedule.map((order) => ({
			order,
			state: baseState(order, now),
		}));

		const activeIdx = slots.findIndex((s) => s.state === "active");
		const firstUpcomingIdx = slots.findIndex((s) => s.state === "upcoming");
		if (firstUpcomingIdx !== -1) slots[firstUpcomingIdx].state = "next";

		const focusIndex =
			activeIdx !== -1
				? activeIdx
				: firstUpcomingIdx !== -1
					? firstUpcomingIdx
					: Math.max(0, slots.length - 1);

		return { slots, focusIndex };
	}, [schedule]);
}

function TimelineNode({ state }: { state: NodeState }) {
	const colors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const pulse = useSharedValue(0);

	useEffect(() => {
		if (state === "active" && !reducedMotion) {
			pulse.value = withRepeat(
				withSequence(
					withTiming(1, { duration: 1100, easing: Easing.out(Easing.quad) }),
					withTiming(0, { duration: 0 }),
				),
				-1,
				false,
			);
		} else {
			pulse.value = 0;
		}
	}, [state, reducedMotion, pulse]);

	// Expanding halo for the live job only.
	const haloStyle = useAnimatedStyle(() => ({
		opacity: (1 - pulse.value) * 0.35,
		transform: [{ scale: 1 + pulse.value * 1.6 }],
	}));

	if (state === "done") {
		return (
			<View
				style={{
					width: 18,
					height: 18,
					borderRadius: 9,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: colors.textMuted,
				}}
			>
				<Check size={11} color={colors.surfaceBase} strokeWidth={3} />
			</View>
		);
	}

	if (state === "active") {
		return (
			<View style={{ alignItems: "center", justifyContent: "center" }}>
				<Animated.View
					style={[
						{
							position: "absolute",
							width: 18,
							height: 18,
							borderRadius: 9,
							backgroundColor: colors.primary,
						},
						haloStyle,
					]}
				/>
				<View
					style={{
						width: 18,
						height: 18,
						borderRadius: 9,
						backgroundColor: colors.primary,
						borderWidth: 3,
						borderColor: colors.surfaceBase,
					}}
				/>
			</View>
		);
	}

	if (state === "next") {
		return (
			<View
				style={{
					width: 16,
					height: 16,
					borderRadius: 8,
					backgroundColor: colors.primary,
					borderWidth: 3,
					borderColor: colors.surfaceBase,
				}}
			/>
		);
	}

	// upcoming / missed → hollow ring (missed dimmed via warning tint).
	return (
		<View
			style={{
				width: 13,
				height: 13,
				borderRadius: 7,
				backgroundColor: colors.surfaceBase,
				borderWidth: 2,
				borderColor: state === "missed" ? colors.warning : colors.borderDefault,
			}}
		/>
	);
}

function SlotRow({
	slot,
	index,
	onPress,
}: {
	slot: TimelineSlot;
	index: number;
	onPress: () => void;
}) {
	const { t } = useTranslation("technician");
	const { order, state } = slot;
	const time = formatSlotTime(order.scheduled_start_at);
	const isDone = state === "done";
	const emphasized = state === "active" || state === "next";

	const label =
		order.service_name ?? order.problem_description ?? t("home.common.job");
	const who = order.user_name ? ` · ${order.user_name}` : "";

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 60).duration(380)}
			style={{ height: ROW_H }}
			className="flex-row items-center"
		>
			<View className="w-7 items-center">
				<TimelineNode state={state} />
			</View>

			<PressableScale
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={t("home.common.openNamedDetails", {
					name: label,
				})}
				className="ml-1 flex-1"
			>
				<View
					className={`gap-0.5 rounded-card px-card py-stack-sm ${
						emphasized ? "bg-app-primary-light" : "bg-surface-muted"
					}`}
				>
					<View className="flex-row items-center justify-between gap-stack-sm">
						<Text
							variant="caption"
							className={`font-bold ${
								state === "active" || state === "next"
									? "text-app-primary"
									: isDone
										? "text-content-muted"
										: "text-content-secondary"
							}`}
						>
							{time}
						</Text>
						{state === "next" ? (
							<View className="rounded-pill bg-app-primary px-2 py-0.5">
								<Text
									variant="caption"
									className="font-bold text-surface-on-primary"
								>
									{t("home.timeline.next")}
								</Text>
							</View>
						) : state === "active" ? (
							<View className="rounded-pill bg-app-primary-light px-2 py-0.5">
								<Text variant="caption" className="font-bold text-app-primary">
									{t("home.timeline.onNow")}
								</Text>
							</View>
						) : order.final_price == null ? null : (
							<Text variant="caption" className="font-semibold text-content">
								{formatEgp(order.final_price)}
							</Text>
						)}
					</View>

					<Text
						variant="body"
						className={`${
							isDone ? "text-content-muted line-through" : "text-content"
						}`}
						numberOfLines={1}
					>
						{label}
						{who}
					</Text>
				</View>
			</PressableScale>
		</Animated.View>
	);
}

function Rail({ focusIndex, count }: { focusIndex: number; count: number }) {
	const colors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const fill = useSharedValue(0);

	const railTop = ROW_H / 2;
	const railFullHeight = Math.max(0, (count - 1) * ROW_H);
	const fillTarget = Math.min(focusIndex * ROW_H, railFullHeight);

	useEffect(() => {
		if (reducedMotion) {
			fill.value = fillTarget;
			return;
		}
		fill.value = withDelay(
			120,
			withTiming(fillTarget, {
				duration: 900,
				easing: Easing.out(Easing.cubic),
			}),
		);
	}, [fillTarget, reducedMotion, fill]);

	const fillStyle = useAnimatedStyle(() => ({ height: fill.value }));

	if (count <= 1) return null;

	return (
		<>
			<View
				style={{
					position: "absolute",
					left: RAIL_X,
					top: railTop,
					height: railFullHeight,
					width: 2,
					borderRadius: 1,
					backgroundColor: colors.borderDefault,
				}}
			/>
			<Animated.View
				style={[
					{
						position: "absolute",
						left: RAIL_X,
						top: railTop,
						width: 2,
						borderRadius: 1,
						backgroundColor: colors.primary,
					},
					fillStyle,
				]}
			/>
		</>
	);
}

export function ScheduleTimeline() {
	const { t } = useTranslation("technician");
	const router = useRouter();
	const schedule = useTodaySchedule();
	const { slots, focusIndex } = useTimeline(schedule);

	// Collapse when empty — the quiet-state hero line covers a free day.
	if (schedule.length === 0) return null;

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader
				title={t("home.sections.todaySchedule")}
				action={
					<Button
						variant="ghost"
						size="sm"
						onPress={() => router.push(ROUTES.technician.schedule)}
					>
						<Icon as={CalendarDays} size={15} className="text-app-primary" />
						<Text variant="buttonMd" className="text-app-primary">
							{t("home.timeline.calendar")}
						</Text>
					</Button>
				}
			/>

			<View className="relative">
				<Rail focusIndex={focusIndex} count={slots.length} />
				{slots.map((slot, i) => (
					<SlotRow
						key={slot.order.id}
						slot={slot}
						index={i}
						onPress={() =>
							router.push(ROUTES.technician.bookingDetail(slot.order.id))
						}
					/>
				))}
			</View>
		</View>
	);
}
