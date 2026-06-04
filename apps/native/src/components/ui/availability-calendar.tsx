// AvailabilityCalendar — booking/reschedule calendar with a custom day cell.
//
// Distinct from calendar-picker.tsx: it draws technician availability directly —
// past days greyed, unavailable days SLASHED (diagonal strike), the selected day
// filled with the brand primary. All day math is anchored to Africa/Cairo so it
// matches the server's EXTRACT(DOW FROM scheduled_date) and never drifts across
// the UTC-midnight boundary.

import { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { Text } from "@/src/components/ui/text";
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
}

export function AvailabilityCalendar({
	templates,
	exceptions,
	selectedDate,
	onDateSelect,
	monthsAhead = 3,
	permissiveWhenEmpty = false,
}: AvailabilityCalendarProps) {
	const themeColors = useThemeColors();
	const tokens = useThemeTokens();
	const calendarTheme = useMemo(() => getCalendarTheme(tokens), [tokens]);

	const today = useMemo(() => cairoTodayYmd(), []);
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

			// Selected (available) day → filled primary circle.
			if (isSelected && !isBlocked) {
				return (
					<View
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
					</View>
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
				return (
					<View className="h-9 w-9 items-center justify-center">
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
					</View>
				);
			}

			// Available day → tappable.
			return (
				<TouchableOpacity
					onPress={() => onDateSelect(ymd)}
					activeOpacity={0.7}
					className="h-9 w-9 items-center justify-center rounded-pill"
				>
					<Text variant="bodySm" style={{ color: themeColors.textCalendar }}>
						{date.day}
					</Text>
				</TouchableOpacity>
			);
		},
		[
			today,
			templates.length,
			permissiveWhenEmpty,
			availableDays,
			exceptionDates,
			selectedDate,
			onDateSelect,
			themeColors,
		],
	);

	return (
		<Calendar
			minDate={today}
			maxDate={maxDate}
			theme={calendarTheme}
			dayComponent={DayCell}
			disableAllTouchEventsForDisabledDays
		/>
	);
}
