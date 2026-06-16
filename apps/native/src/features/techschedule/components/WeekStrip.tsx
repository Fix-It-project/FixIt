import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	FlatList,
	type LayoutChangeEvent,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import { DUR_CALENDAR_SELECT, EASE_OUT_QUART } from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	addDaysYmd,
	dayNumber,
	dayOfWeek,
	startOfWeekYmd,
	weekDays,
} from "../utils/date";

/** How many weeks forward the strip can browse. The past is never reachable — the
 *  list starts on the week that contains today, so there is no page before it. */
const HORIZON_WEEKS = 104;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

interface WeekStripProps {
	/** Any date inside the week to display. Swiping commits a new anchor. */
	readonly weekAnchor: string;
	readonly selectedDate: string;
	readonly today: string;
	readonly orderDates: ReadonlySet<string>;
	readonly exceptionDates: ReadonlySet<string>;
	readonly availableDayOfWeek: ReadonlySet<number>;
	readonly onSelect: (date: string) => void;
	/** Commit the week scrolled into view. */
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
	const { t } = useTranslation("technician");
	const shortDays = t("calendar.weekdaysShort", {
		returnObjects: true,
	}) as string[];
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
				{shortDays[dow]}
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

/** Week index (0-based) of `ymd` relative to `firstWeekStart`, clamped to range. */
function weekIndexOf(ymd: string, firstWeekStart: string): number {
	const toUtc = (s: string) => {
		const [y, m, d] = s.split("-").map(Number);
		return Date.UTC(y, m - 1, d);
	};
	const raw = Math.round(
		(toUtc(startOfWeekYmd(ymd)) - toUtc(firstWeekStart)) / MS_PER_WEEK,
	);
	return Math.max(0, Math.min(HORIZON_WEEKS - 1, raw));
}

/**
 * Horizontal Sun→Sat week strip backed by a paged `FlatList`. Native scrolling
 * keeps the position on the UI thread, so a swipe never desyncs from its content
 * — no recentre, no flicker. The first page is the week containing today, so the
 * list cannot scroll into the past; only the current week and beyond are
 * reachable. Tapping a day selects it, identical to tapping in the month
 * calendar.
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
	const listRef = useRef<FlatList<string>>(null);
	// Tracks the page currently centred so external anchor changes (e.g. tapping a
	// future day in the month calendar) scroll the strip, while our own swipes —
	// which already moved the list natively — do not trigger a redundant scroll.
	const currentIndexRef = useRef(0);

	const firstWeekStart = useMemo(() => startOfWeekYmd(today), [today]);

	const weeks = useMemo(
		() =>
			Array.from({ length: HORIZON_WEEKS }, (_, i) =>
				addDaysYmd(firstWeekStart, i * 7),
			),
		[firstWeekStart],
	);

	const onLayout = useCallback(
		(e: LayoutChangeEvent) => {
			const next = e.nativeEvent.layout.width;
			if (next !== width) setWidth(next);
		},
		[width],
	);

	const getItemLayout = useCallback(
		(_: ArrayLike<string> | null | undefined, index: number) => ({
			length: width,
			offset: width * index,
			index,
		}),
		[width],
	);

	const onMomentumEnd = useCallback(
		(e: NativeSyntheticEvent<NativeScrollEvent>) => {
			if (width <= 0) return;
			const i = Math.max(
				0,
				Math.min(
					weeks.length - 1,
					Math.round(e.nativeEvent.contentOffset.x / width),
				),
			);
			currentIndexRef.current = i;
			const anchor = weeks[i];
			if (startOfWeekYmd(anchor) !== startOfWeekYmd(weekAnchor)) {
				onWeekChange(anchor);
			}
		},
		[width, weeks, weekAnchor, onWeekChange],
	);

	// Mirror an externally driven anchor (a calendar tap in another week) onto the
	// scroll position. Skipped when the target is already centred so our own
	// swipes don't fight the native scroll.
	useEffect(() => {
		if (width <= 0) return;
		const i = weekIndexOf(weekAnchor, firstWeekStart);
		if (i === currentIndexRef.current) return;
		currentIndexRef.current = i;
		listRef.current?.scrollToIndex({ index: i, animated: true });
	}, [weekAnchor, width, firstWeekStart]);

	const cell = useMemo(
		() => ({
			selectedDate,
			today,
			orderDates,
			exceptionDates,
			availableDayOfWeek,
			onSelect,
		}),
		[
			selectedDate,
			today,
			orderDates,
			exceptionDates,
			availableDayOfWeek,
			onSelect,
		],
	);

	const renderItem = useCallback(
		({ item }: { item: string }) => (
			<WeekPanel anchor={item} width={width} {...cell} />
		),
		[width, cell],
	);

	return (
		<View onLayout={onLayout} className="overflow-hidden">
			{width > 0 ? (
				<FlatList
					ref={listRef}
					data={weeks}
					keyExtractor={(item) => item}
					renderItem={renderItem}
					getItemLayout={getItemLayout}
					initialScrollIndex={weekIndexOf(weekAnchor, firstWeekStart)}
					horizontal
					pagingEnabled
					bounces={false}
					showsHorizontalScrollIndicator={false}
					onMomentumScrollEnd={onMomentumEnd}
					onScrollToIndexFailed={(info) => {
						listRef.current?.scrollToOffset({
							offset: info.index * width,
							animated: false,
						});
					}}
					style={{ width }}
				/>
			) : null}
		</View>
	);
}
