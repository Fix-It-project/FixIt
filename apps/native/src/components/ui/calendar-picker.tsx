// CalendarPicker — themed wrapper over react-native-calendars. Import from here; never import Calendar directly.

import { useMemo } from "react";
import { Calendar, type CalendarProps } from "react-native-calendars";
import { getCalendarTheme, useThemeTokens } from "@/src/constants/design-tokens";

interface CalendarPickerProps
	extends Omit<
		CalendarProps,
		"theme" | "markedDates" | "minDate" | "maxDate" | "onDayPress"
	> {
	/** ISO YYYY-MM-DD — auto-highlighted as selected */
	selectedDate?: string;
	/** Called with the YYYY-MM-DD string when the user taps a day */
	onDateSelect?: (date: string) => void;
	/** ISO YYYY-MM-DD — earliest selectable day */
	minDate?: string;
	/** ISO YYYY-MM-DD — latest selectable day */
	maxDate?: string;
	/** ISO YYYY-MM-DD[] — days rendered as disabled */
	disabledDates?: string[];
	/** Custom marks merged on top of the auto-computed selection / disabled marks */
	markedDates?: CalendarProps["markedDates"];
	/** Forwarded to the underlying Calendar root view */
	style?: CalendarProps["style"];
}

function CalendarPicker({
	selectedDate,
	onDateSelect,
	minDate,
	maxDate,
	disabledDates,
	markedDates: externalMarkedDates,
	style,
	...rest
}: Readonly<CalendarPickerProps>) {
	const tokens = useThemeTokens();

	const calendarTheme = useMemo(() => getCalendarTheme(tokens), [tokens]);

	const mergedMarkedDates = useMemo<CalendarProps["markedDates"]>(() => {
		const marks: NonNullable<CalendarProps["markedDates"]> = {};

		// Disabled dates come first so selection can override them if needed
		if (disabledDates) {
			for (const date of disabledDates) {
				marks[date] = { disabled: true, disableTouchEvent: true };
			}
		}

		// Auto-mark the selected date
		if (selectedDate) {
			const selectedMark = marks[selectedDate];
			marks[selectedDate] = selectedMark
				? {
						...selectedMark,
						selected: true,
						selectedColor: tokens.primary,
					}
				: {
						selected: true,
						selectedColor: tokens.primary,
					};
		}

		// Caller-supplied marks win — spread last so consumers can override anything
		if (externalMarkedDates) {
			for (const [date, mark] of Object.entries(externalMarkedDates)) {
				const existingMark = marks[date];
				marks[date] = existingMark ? { ...existingMark, ...mark } : mark;
			}
		}

		return marks;
	}, [disabledDates, externalMarkedDates, selectedDate, tokens.primary]);

	return (
		<Calendar
			minDate={minDate}
			maxDate={maxDate}
			onDayPress={(day) => onDateSelect?.(day.dateString)}
			markedDates={mergedMarkedDates}
			theme={calendarTheme}
			style={style}
			{...rest}
		/>
	);
}

export type { CalendarPickerProps };
export { CalendarPicker };
