// AvailabilityCalendar — booking/reschedule calendar with a custom day cell.
//
// Distinct from calendar-picker.tsx: it draws technician availability directly —
// past days greyed, unavailable days SLASHED (diagonal strike), the selected day
// filled with the brand primary. All day math is anchored to Africa/Cairo so it
// matches the server's EXTRACT(DOW FROM scheduled_date) and never drifts across
// the UTC-midnight boundary.

import { useCallback, useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withTiming,
	ZoomIn,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	CALENDAR_MONTH_SLIDE_X,
	DUR_CALENDAR_MONTH,
	DUR_CALENDAR_SELECT,
	EASE_OUT_EXPO,
	EASE_OUT_QUART,
} from "@/src/constants/animation";
import {
	getCalendarTheme,
	useThemeColors,
	useThemeTokens,
} from "@/src/constants/design-tokens";

const CAIRO_TZ = "Africa/Cairo";

/** Today in Cairo as YYYY-MM-DD (en-CA formats as ISO date). */
function cairoTodayYmd(): string {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: CAIRO_TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

function addMonthsYmd(ymd: string, months: number): string {
	const [y, m, d] = ymd.split("-").map(Number);
	return new Date(Date.UTC(y, m - 1 + months, d)).toISOString().slice(0, 10);
}

/**
 * Weekday (0=Sun) for a plain YYYY-MM-DD. The components are fixed, so
 * local-midnight yields the same weekday the date represents — timezone-safe.
 */
function dayOfWeek(ymd: string): number {
	return new Date(`${ymd}T00:00:00`).getDay();
}

function monthIndex(ymd: string): number {
	const [year, month] = ymd.split("-").map(Number);
	return year * 12 + month;
}

interface DayTemplate {
	day_of_week: number;
	active: boolean;
}

interface ExceptionEntry {
	date: string;
}

interface AvailabilityCalendarProps {
	readonly templates: readonly DayTemplate[];
	readonly exceptions: readonly ExceptionEntry[];
	readonly selectedDate?: string | null;
	readonly onDateSelect: (date: string) => void;
	/** How far ahead the calendar can scroll. Defaults to 3 months. */
	readonly monthsAhead?: number;
	/**
	 * When there are no templates, treat every future day as available instead
	 * of unavailable. Used by reschedule when technician availability is unknown.
	 */
	readonly permissiveWhenEmpty?: boolean;
	/** Dates (YYYY-MM-DD) that have orders — painted with a small dot. */
	readonly orderDates?: readonly string[];
	/**
	 * Technician-only: makes future UNAVAILABLE days tappable (so the tech can
	 * select one to view it / un-mark it). Default `false` keeps the user +
	 * reschedule behaviour of blocking unavailable days untouched.
	 */
	readonly allowUnavailableSelection?: boolean;
	/**
	 * Override the calendar surface color (default = theme surface). Pass
	 * `"transparent"` to blend the calendar seamlessly into a parent card instead
	 * of painting its own panel.
	 */
	readonly backgroundColor?: string;
}

export function AvailabilityCalendar({
	templates,
	exceptions,
	selectedDate,
	onDateSelect,
	monthsAhead = 3,
	permissiveWhenEmpty = false,
	orderDates,
	allowUnavailableSelection = false,
	backgroundColor,
}: AvailabilityCalendarProps) {
	const themeColors = useThemeColors();
	const tokens = useThemeTokens();
	const reducedMotion = useReducedMotion();
	const monthProgress = useSharedValue(1);
	const monthDirection = useSharedValue(1);
	const calendarTheme = useMemo(
		() =>
			backgroundColor
				? { ...getCalendarTheme(tokens), calendarBackground: backgroundColor }
				: getCalendarTheme(tokens),
		[tokens, backgroundColor],
	);

	const today = useMemo(() => cairoTodayYmd(), []);
	const [visibleMonth, setVisibleMonth] = useState(selectedDate ?? today);
	const maxDate = useMemo(
		() => addMonthsYmd(today, monthsAhead),
		[today, monthsAhead],
	);

	const availableDays = useMemo(() => {
		const set = new Set<number>();
		for (const t of templates) if (t.active) set.add(t.day_of_week);
		return set;
	}, [templates]);

	const exceptionDates = useMemo(
		() => new Set(exceptions.map((e) => e.date)),
		[exceptions],
	);

	const orderDateSet = useMemo(
		() => new Set(orderDates ?? []),
		[orderDates],
	);

	const orderDotStyle = useMemo(
		() =>
			({
				position: "absolute",
				bottom: 3,
				width: 5,
				height: 5,
				borderRadius: 999,
				backgroundColor: themeColors.success,
			}) as const,
		[themeColors.success],
	);

	const calendarAnimatedStyle = useAnimatedStyle(() => ({
		opacity: 0.78 + monthProgress.value * 0.22,
		transform: [
			{
				translateX:
					(1 - monthProgress.value) *
					monthDirection.value *
					CALENDAR_MONTH_SLIDE_X,
			},
		],
	}));

	const handleMonthChange = useCallback(
		(date: DateData) => {
			const nextMonth = date.dateString;
			if (nextMonth.slice(0, 7) === visibleMonth.slice(0, 7)) return;

			monthDirection.value =
				monthIndex(nextMonth) > monthIndex(visibleMonth) ? 1 : -1;
			setVisibleMonth(nextMonth);

			if (reducedMotion) return;
			monthProgress.value = 0;
			monthProgress.value = withTiming(1, {
				duration: DUR_CALENDAR_MONTH,
				easing: EASE_OUT_EXPO,
			});
		},
		[monthDirection, monthProgress, reducedMotion, visibleMonth],
	);

	const DayCell = useCallback(
		({ date }: { date?: DateData }) => {
			if (!date) return <View className="h-9 w-9" />;
			const ymd = date.dateString;

			const isPast = ymd < today;
			const hasTemplates = templates.length > 0;
			const isUnavailable = hasTemplates
				? !availableDays.has(dayOfWeek(ymd)) || exceptionDates.has(ymd)
				: permissiveWhenEmpty
					? exceptionDates.has(ymd)
					: true;
			const isSelected = ymd === selectedDate;
			const isBlocked = isPast || isUnavailable;
			const hasOrder = orderDateSet.has(ymd);

			// Selected (available) day → filled primary circle.
			if (isSelected && !isBlocked) {
				return (
					<Animated.View
						entering={
							reducedMotion
								? undefined
								: ZoomIn.duration(DUR_CALENDAR_SELECT).easing(EASE_OUT_QUART)
						}
						className="h-9 w-9 items-center justify-center rounded-pill"
						style={{ backgroundColor: themeColors.primary }}
					>
						<Text
							variant="bodySm"
							className="font-bold"
							style={{ color: themeColors.surfaceOnPrimary }}
						>
							{date.day}
						</Text>
					</Animated.View>
				);
			}

			// Past day → greyed, not pressable, NO strike.
			if (isPast) {
				return (
					<View className="h-9 w-9 items-center justify-center">
						<Text variant="bodySm" style={{ color: themeColors.borderDefault }}>
							{date.day}
						</Text>
					</View>
				);
			}

			// Future-but-unavailable day → SLASHED (diagonal strike over a muted number).
			if (isUnavailable) {
				const slashCell = (
					<>
						<Text variant="bodySm" style={{ color: themeColors.textMuted }}>
							{date.day}
						</Text>
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
					</>
				);
				// Technician mode: let the tech tap an unavailable day to view / un-mark
				// it. Default keeps unavailable days inert for user + reschedule flows.
				if (allowUnavailableSelection) {
					return (
						<TouchableOpacity
							onPress={() => onDateSelect(ymd)}
							activeOpacity={0.7}
							className="h-9 w-9 items-center justify-center rounded-pill"
							style={
								isSelected
									? { borderWidth: 1.5, borderColor: themeColors.primary }
									: undefined
							}
						>
							{slashCell}
						</TouchableOpacity>
					);
				}
				return (
					<View className="h-9 w-9 items-center justify-center">{slashCell}</View>
				);
			}

			// Available day → tappable (order days get a dot).
			return (
				<TouchableOpacity
					onPress={() => onDateSelect(ymd)}
					activeOpacity={0.7}
					testID="calendar-available-day"
					className="h-9 w-9 items-center justify-center rounded-pill"
				>
					<Text variant="bodySm" style={{ color: themeColors.textCalendar }}>
						{date.day}
					</Text>
					{hasOrder ? <View pointerEvents="none" style={orderDotStyle} /> : null}
				</TouchableOpacity>
			);
		},
		[
			today,
			templates.length,
			permissiveWhenEmpty,
			availableDays,
			exceptionDates,
			orderDateSet,
			orderDotStyle,
			allowUnavailableSelection,
			selectedDate,
			onDateSelect,
			reducedMotion,
			themeColors,
		],
	);

	return (
		<View className="overflow-hidden">
			<Animated.View style={calendarAnimatedStyle}>
				<Calendar
					current={visibleMonth}
					minDate={today}
					maxDate={maxDate}
					theme={calendarTheme}
					dayComponent={DayCell}
					onMonthChange={handleMonthChange}
					enableSwipeMonths
					disableAllTouchEventsForDisabledDays
				/>
			</Animated.View>
		</View>
	);
}
