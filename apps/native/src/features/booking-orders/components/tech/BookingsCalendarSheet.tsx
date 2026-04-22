import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { useWindowDimensions } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { Text } from "@/src/components/ui/text";
import { useBookingsDateStore } from "@/src/features/booking-orders/stores/bookings-date-store";
import {
	todayIso,
	toIso,
} from "@/src/features/booking-orders/utils/date-helpers";
import {
	getCalendarTheme,
	spacing,
	useThemeColors,
	useThemeTokens,
} from "@/src/lib/theme";
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
		const themeTokens = useThemeTokens();
		const sheetRef = useRef<BottomSheetModal>(null);
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

		const calendarTheme = useMemo(
			() => getCalendarTheme(themeTokens),
			[themeTokens.id],
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

		const renderBackdrop = useCallback(
			(props: any) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					pressBehavior="close"
				/>
			),
			[],
		);

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

		const handleDayPress = useCallback(
			(day: DateData) => {
				if (day.dateString < todayIso) return;
				const d = new Date(day.year, day.month - 1, day.day);
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

				<BottomSheetModal
					ref={sheetRef}
					snapPoints={[Math.min(screenHeight * 0.6, 520)]}
					enablePanDownToClose
					onChange={handleSheetChange}
					backdropComponent={renderBackdrop}
					backgroundStyle={{ backgroundColor: themeColors.surfaceBase }}
					handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
					width: spacing.sheet.handleWidth,
				}}
				>
					<BottomSheetView
						className="flex-1 px-4 pb-4"
						style={{ backgroundColor: themeColors.surfaceBase }}
					>
						<Text
							variant="buttonLg"
							className="mb-2 text-center font-bold"
							style={{ color: themeColors.textPrimary }}
						>
							Jump to Date
						</Text>
						<Calendar
							key={`bookings-calendar-${calendarRenderKey}`}
							current={visibleMonthIso}
							minDate={todayIso}
							onDayPress={handleDayPress}
							onMonthChange={handleMonthChange}
							markedDates={markedDates}
							enableSwipeMonths
							disableArrowLeft={visibleMonthIso <= currentMonthIso}
							theme={calendarTheme}
						/>
					</BottomSheetView>
				</BottomSheetModal>
			</>
		);
	},
);

export default BookingsCalendarSheet;
