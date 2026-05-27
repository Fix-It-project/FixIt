import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { useWindowDimensions } from "react-native";
import type { DateData } from "react-native-calendars";
import {
	BottomSheet,
	type BottomSheetModalRef,
} from "@/src/components/ui/bottom-sheet";
import { CalendarPicker } from "@/src/components/ui/calendar-picker";
import { Text } from "@/src/components/ui/text";
import { useBookingsDateStore } from "@/src/features/booking-orders/stores/bookings-date-store";
import {
	todayIso,
	toIso,
} from "@/src/features/booking-orders/utils/date-helpers";
import { spacing, useThemeColors } from "@/src/lib/theme";
import { useTechnicianBookingDates } from "../../hooks/useTechnicianBookingsQuery";
import { buildBookingsCalendarMarks } from "../../utils/buildBookingsCalendarMarks";
import BookingsCalendarTrigger from "./BookingsCalendarTrigger";

export interface BookingsCalendarSheetRef {
	closeIfOpen: () => boolean;
}

function getLaterMonthIso(firstIso: string, secondIso: string) {
	const laterTimestamp = Math.max(Date.parse(firstIso), Date.parse(secondIso));
	return toIso(new Date(laterTimestamp));
}

const BookingsCalendarSheet = forwardRef<BookingsCalendarSheetRef, object>(
	function BookingsCalendarSheet(_, ref) {
		const themeColors = useThemeColors();
		const sheetRef = useRef<BottomSheetModalRef>(null);
		const isSheetOpenRef = useRef(false);
		const { selectedDate, setSelectedDate } = useBookingsDateStore();
		const { data: bookingDates } = useTechnicianBookingDates();
		const { height: screenHeight } = useWindowDimensions();
		const [calendarRenderKey, setCalendarRenderKey] = useState(0);

		const currentMonthIso = `${todayIso.slice(0, 7)}-01`;
		const selectedIso = toIso(selectedDate);
		const selectedMonthIso = toIso(
			new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
		);
		const [visibleMonthIso, setVisibleMonthIso] = useState(
			getLaterMonthIso(currentMonthIso, selectedMonthIso),
		);
		const markedDates = useMemo(
			() => buildBookingsCalendarMarks(bookingDates, selectedIso, themeColors),
			[bookingDates, selectedIso, themeColors],
		);

		const handleOpen = useCallback(() => {
			setVisibleMonthIso(getLaterMonthIso(currentMonthIso, selectedMonthIso));
			setCalendarRenderKey((current) => current + 1);
			isSheetOpenRef.current = true;
			sheetRef.current?.present();
		}, [currentMonthIso, selectedMonthIso]);

		const handleSheetChange = useCallback((index: number) => {
			isSheetOpenRef.current = index >= 0;
		}, []);

		useImperativeHandle(
			ref,
			() => ({
				closeIfOpen: () => {
					if (!isSheetOpenRef.current) return false;
					sheetRef.current?.dismiss();
					return true;
				},
			}),
			[],
		);

		const handleDateSelect = useCallback(
			(dateString: string) => {
				if (dateString < todayIso) return;
				const [year, month, day] = dateString.split("-").map(Number);
				if (!year || !month || !day) return;
				const d = new Date(year, month - 1, day);
				setSelectedDate(d);
				sheetRef.current?.dismiss();
			},
			[setSelectedDate],
		);

		const handleMonthChange = useCallback((month: DateData) => {
			const monthIso = `${month.year}-${String(month.month).padStart(2, "0")}-01`;
			setVisibleMonthIso(monthIso);
		}, []);

		return (
			<>
				<BookingsCalendarTrigger
					onPress={handleOpen}
					themeColors={themeColors}
				/>

				<BottomSheet.Modal
					ref={sheetRef}
					snapPoints={[Math.min(screenHeight * 0.6, 520)]}
					onChange={handleSheetChange}
					handleIndicatorStyle={{
						backgroundColor: themeColors.borderDefault,
						width: spacing.sheet.handleWidth,
					}}
				>
					<BottomSheet.View
						className="flex-1 px-screen-x pb-card"
						style={{ backgroundColor: themeColors.surfaceBase }}
					>
						<Text
							variant="buttonLg"
							className="mb-stack-sm text-center font-bold"
							style={{ color: themeColors.textPrimary }}
						>
							Jump to Date
						</Text>
						<CalendarPicker
							key={`bookings-calendar-${calendarRenderKey}`}
							current={visibleMonthIso}
							minDate={todayIso}
							onDateSelect={handleDateSelect}
							onMonthChange={handleMonthChange}
							markedDates={markedDates}
							enableSwipeMonths
							disableArrowLeft={visibleMonthIso <= currentMonthIso}
						/>
					</BottomSheet.View>
				</BottomSheet.Modal>
			</>
		);
	},
);

export default BookingsCalendarSheet;
