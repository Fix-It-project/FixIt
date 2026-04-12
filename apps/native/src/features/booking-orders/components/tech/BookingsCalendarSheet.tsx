import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { todayIso, toIso } from "@/src/lib/helpers/date-helpers";
import { useBookingsDateStore } from "@/src/stores/bookings-date-store";
import { useTechBookingDatesQuery } from "@/src/hooks/tech/useTechBookingsQuery";
import { Text } from "@/src/components/ui/text";
import {
  getCalendarTheme,
  useThemeColors,
  useThemeTokens,
} from "@/src/lib/theme";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { CalendarList, type DateData } from "react-native-calendars";

const MONTHS_AHEAD = 24;

/**
 * "Jump" button + bottom-sheet month calendar.
 *
 * Uses BottomSheetModal (portal-based) so it renders above all content.
 * CalendarList with horizontal + pagingEnabled gives a native swipe-to-navigate-months
 * slide animation with no manual animation code.
 */
export interface BookingsCalendarSheetRef {
  closeIfOpen: () => boolean;
}

const BookingsCalendarSheet = forwardRef<BookingsCalendarSheetRef, object>(
  function BookingsCalendarSheet(_, ref) {
    const themeColors = useThemeColors();
    const themeTokens = useThemeTokens();
    const sheetRef = useRef<BottomSheetModal>(null);
    const isSheetOpenRef = useRef(false);
    const { selectedDate, visibleMonth, setSelectedDate, setVisibleMonth } =
      useBookingsDateStore();
    const { data: bookingDates } = useTechBookingDatesQuery();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [calendarRenderKey, setCalendarRenderKey] = useState(0);

    const selectedIso = toIso(selectedDate);
    const visibleMonthIso = toIso(visibleMonth);

    const markedDates = useMemo(() => {
      const marks: Record<
        string,
        {
          marked?: boolean;
          dotColor?: string;
          selected?: boolean;
          selectedColor?: string;
        }
      > = {};

      if (bookingDates) {
        for (const dateStr of bookingDates) {
          marks[dateStr] = {
            marked: true,
            dotColor: themeColors.ratingDefault,
          };
        }
      }

      marks[selectedIso] = {
        ...marks[selectedIso],
        selected: true,
        selectedColor: themeColors.primary,
      };

      return marks;
    }, [
      bookingDates,
      selectedIso,
      themeColors.primary,
      themeColors.ratingDefault,
    ]);

    const calendarTheme = useMemo(
      () => getCalendarTheme(themeTokens),
      [themeTokens.id],
    );

    const handleOpen = useCallback(() => {
      setVisibleMonth(selectedDate);
      setCalendarRenderKey((current) => current + 1);
      isSheetOpenRef.current = true;
      sheetRef.current?.present();
    }, [selectedDate, setVisibleMonth]);

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

    const handleDayPress = useCallback(
      (day: DateData) => {
        const d = new Date(day.year, day.month - 1, day.day);
        setSelectedDate(d);
        sheetRef.current?.dismiss();
      },
      [setSelectedDate],
    );

    const handleVisibleMonthsChange = useCallback(
      (months: DateData[]) => {
        const firstVisibleMonth = months[0];
        if (!firstVisibleMonth) return;

        setVisibleMonth(
          new Date(firstVisibleMonth.year, firstVisibleMonth.month - 1, 1),
        );
      },
      [setVisibleMonth],
    );

    return (
      <>
        {/* Jump button */}
        <TouchableOpacity
          onPress={handleOpen}
          className="flex-row items-center gap-1.5 self-end rounded-xl px-3 py-2"
          style={{
            backgroundColor: themeColors.primaryLight,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
          activeOpacity={0.7}
        >
          <CalendarDays size={14} color={themeColors.primary} strokeWidth={2} />
          <Text
            style={{
              fontSize: 12,
              fontFamily: "GoogleSans_600SemiBold",
              color: themeColors.primary,
            }}
          >
            Jump
          </Text>
        </TouchableOpacity>

        {/* Bottom sheet calendar — renders via portal above all content */}
        <BottomSheetModal
          ref={sheetRef}
          snapPoints={[Math.min(screenHeight * 0.6, 520)]}
          enablePanDownToClose
          onChange={handleSheetChange}
          backgroundStyle={{ backgroundColor: themeColors.surfaceBase }}
          handleIndicatorStyle={{
            backgroundColor: themeColors.borderDefault,
            width: 40,
          }}
        >
          <BottomSheetView
            className="flex-1 px-4 pb-4"
            style={{ backgroundColor: themeColors.surfaceBase }}
          >
            <Text
              className="mb-2 text-center"
              style={{
                fontFamily: "GoogleSans_700Bold",
                fontSize: 16,
                color: themeColors.textPrimary,
              }}
            >
              Jump to Date
            </Text>
            <CalendarList
              key={`${visibleMonthIso}-${calendarRenderKey}`}
              current={visibleMonthIso}
              minDate={todayIso}
              pastScrollRange={0}
              futureScrollRange={MONTHS_AHEAD}
              onDayPress={handleDayPress}
              onVisibleMonthsChange={handleVisibleMonthsChange}
              markedDates={markedDates}
              horizontal
              pagingEnabled
              staticHeader
              calendarWidth={screenWidth - 32}
              showScrollIndicator={false}
              theme={calendarTheme}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </>
    );
  },
);

export default BookingsCalendarSheet;
