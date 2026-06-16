import { useCallback, useEffect, useState } from "react";
import {
	type LayoutChangeEvent,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
	ZoomIn,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	DUR_CALENDAR_SELECT,
	EASE_OUT_EXPO,
	EASE_OUT_QUART,
} from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { SHORT_DAY_NAMES } from "../constants";
import { addDaysYmd, dayNumber, dayOfWeek, weekDays } from "../utils/date";

interface WeekStripProps {
	/** Any date inside the week to display. Swiping commits a new anchor. */
	readonly weekAnchor: string;
	readonly selectedDate: string;
	readonly today: string;
	readonly orderDates: ReadonlySet<string>;
	readonly exceptionDates: ReadonlySet<string>;
	readonly availableDayOfWeek: ReadonlySet<number>;
	readonly onSelect: (date: string) => void;
	/** Commit the adjacent week after a finger swipe settles. */
	readonly onWeekChange: (anchor: string) => void;
}

interface DayCellProps {
	readonly ymd: string;
	readonly selectedDate: string;
	readonly today: string;
	readonly orderDates: ReadonlySet<string>;
	readonly exceptionDates: ReadonlySet<string>;
	readonly availableDayOfWeek: ReadonlySet<number>;
	readonly onSelect: (date: string) => void;
}

/** A single day pill in the strip — slashed when unavailable, dotted when busy. */
function DayCell({
	ymd,
	selectedDate,
	today,
	orderDates,
	exceptionDates,
	availableDayOfWeek,
	onSelect,
}: DayCellProps) {
	const themeColors = useThemeColors();
	const dow = dayOfWeek(ymd);
	const isSelected = ymd === selectedDate;
	const isToday = ymd === today;
	const isPast = ymd < today;
	const isUnavailable = !availableDayOfWeek.has(dow) || exceptionDates.has(ymd);
	const hasOrder = orderDates.has(ymd);

	let numberColor = themeColors.textCalendar;
	if (isSelected) numberColor = themeColors.surfaceOnPrimary;
	else if (isPast) numberColor = themeColors.borderDefault;
	else if (isUnavailable) numberColor = themeColors.textMuted;
	else if (isToday) numberColor = themeColors.primary;

	return (
		<Pressable
			onPress={() => onSelect(ymd)}
			className="flex-1 items-center gap-1 py-stack-xs"
			accessibilityRole="button"
			accessibilityState={{ selected: isSelected }}
		>
			<Text variant="caption" style={{ color: themeColors.textMuted }}>
				{SHORT_DAY_NAMES[dow]}
			</Text>
			<View
				className="h-9 w-9 items-center justify-center rounded-pill"
				style={{
					borderWidth: isToday && !isSelected ? 1.5 : 0,
					borderColor: themeColors.primary,
				}}
			>
				{isSelected ? (
					<Animated.View
						entering={ZoomIn.duration(DUR_CALENDAR_SELECT).easing(
							EASE_OUT_QUART,
						)}
						pointerEvents="none"
						style={[
							StyleSheet.absoluteFill,
							{ borderRadius: 999, backgroundColor: themeColors.primary },
						]}
					/>
				) : null}
				<Text
					variant="bodySm"
					className="font-semibold"
					style={{ color: numberColor }}
				>
					{dayNumber(ymd)}
				</Text>
				{isUnavailable && !isSelected ? (
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							width: 22,
							height: 1.5,
							backgroundColor: themeColors.textMuted,
							transform: [{ rotate: "-45deg" }],
						}}
					/>
				) : null}
				{hasOrder && !isSelected ? (
					<View
						pointerEvents="none"
						style={{
							position: "absolute",
							bottom: 2,
							width: 5,
							height: 5,
							borderRadius: 999,
							backgroundColor: themeColors.success,
						}}
					/>
				) : null}
			</View>
		</Pressable>
	);
}

function WeekPanel({
	anchor,
	width,
	...cell
}: {
	readonly anchor: string;
	readonly width: number;
} & Omit<DayCellProps, "ymd">) {
	return (
		<View className="flex-row justify-between" style={{ width }}>
			{weekDays(anchor).map((ymd) => (
				<DayCell key={ymd} ymd={ymd} {...cell} />
			))}
		</View>
	);
}

/**
 * Horizontal Sun→Sat strip that the finger drags live (UI-thread `onUpdate`),
 * snapping to the previous/next week on release. Three panels render side by
 * side; the middle one is the active week, so a swipe reveals the neighbour
 * already in place — no blank frame. Tapping a day selects it, identical to
 * tapping a day in the month calendar.
 */
export function WeekStrip({
	weekAnchor,
	selectedDate,
	today,
	orderDates,
	exceptionDates,
	availableDayOfWeek,
	onSelect,
	onWeekChange,
}: WeekStripProps) {
	const [width, setWidth] = useState(0);
	const widthSv = useSharedValue(0);
	const tx = useSharedValue(0);

	const onLayout = useCallback(
		(e: LayoutChangeEvent) => {
			const next = e.nativeEvent.layout.width;
			if (next === width) return;
			setWidth(next);
			widthSv.value = next;
			tx.value = -next; // rest centred on the middle (active) panel
		},
		[width, widthSv, tx],
	);

	// Only advance the anchor here. The recentre is deferred to the effect below
	// so it lands *after* the three panels re-render around the new anchor —
	// resetting tx in the same call would snap the middle panel back while it
	// still held the OLD week, flashing the previous week for a frame.
	const commit = useCallback(
		(delta: number) => {
			onWeekChange(addDaysYmd(weekAnchor, delta));
		},
		[onWeekChange, weekAnchor],
	);

	// Recentre onto the (now-active) middle panel once the new anchor has
	// rendered. Instant set, no timing — the content is already the target week,
	// so the position change is invisible.
	useEffect(() => {
		// `weekAnchor` is the trigger (always a truthy ymd); recentre is always to
		// the middle panel, so reading it in the guard is behaviour-neutral.
		if (width > 0 && weekAnchor) tx.value = -widthSv.value;
	}, [weekAnchor, width, tx, widthSv]);

	const pan = Gesture.Pan()
		.activeOffsetX([-12, 12])
		.failOffsetY([-14, 14])
		.onUpdate((e) => {
			tx.value = -widthSv.value + e.translationX;
		})
		.onEnd((e) => {
			const threshold = widthSv.value * 0.22;
			const next = e.translationX <= -threshold || e.velocityX < -600;
			const prev = e.translationX >= threshold || e.velocityX > 600;
			if (next) {
				tx.value = withTiming(
					-2 * widthSv.value,
					{ duration: 200, easing: EASE_OUT_EXPO },
					(done) => done && runOnJS(commit)(7),
				);
			} else if (prev) {
				tx.value = withTiming(
					0,
					{ duration: 200, easing: EASE_OUT_EXPO },
					(done) => done && runOnJS(commit)(-7),
				);
			} else {
				tx.value = withTiming(-widthSv.value, {
					duration: DUR_CALENDAR_SELECT,
					easing: EASE_OUT_EXPO,
				});
			}
		});

	const rowStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: tx.value }],
	}));

	const cell = {
		selectedDate,
		today,
		orderDates,
		exceptionDates,
		availableDayOfWeek,
		onSelect,
	};

	return (
		<View onLayout={onLayout} className="overflow-hidden">
			{width > 0 ? (
				<GestureDetector gesture={pan}>
					<Animated.View className="flex-row" style={rowStyle}>
						<WeekPanel
							anchor={addDaysYmd(weekAnchor, -7)}
							width={width}
							{...cell}
						/>
						<WeekPanel anchor={weekAnchor} width={width} {...cell} />
						<WeekPanel
							anchor={addDaysYmd(weekAnchor, 7)}
							width={width}
							{...cell}
						/>
					</Animated.View>
				</GestureDetector>
			) : null}
		</View>
	);
}
