import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Text } from "@/src/components/ui/text";
import { Toast } from "@/src/components/ui/toast";
import {
	useAddExceptionMutation,
	useDeleteExceptionMutation,
	useExceptionsQuery,
	useSaveTemplatesMutation,
	useTemplatesQuery,
} from "@/src/features/schedule/hooks/useCalendar";
import type { DaySchedule } from "@/src/features/schedule/types/calendar";
import { buildMarkedDates } from "@/src/features/schedule/utils/buildMarkedDates";
import { spacing } from "@/src/lib/design-tokens";
import {
	getCalendarTheme,
	useThemeColors,
	useThemeTokens,
} from "@/src/lib/theme";
import { useScheduledEventsByDate } from "../../hooks/useScheduledEvents";
import ScheduleDayPanel from "./ScheduleDayPanel";
import ScheduleLegend from "./ScheduleLegend";
import ScheduleSetupModal from "./ScheduleSetupModal";

const ALL_DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];
const TODAY = new Date().toISOString().split("T")[0];

interface Props {
	readonly onDismissSetup: () => void;
}

export default function ScheduleScreen({ onDismissSetup }: Props) {
	const themeColors = useThemeColors();
	const themeTokens = useThemeTokens();
	const { data: serverTemplates, isLoading: isLoadingTemplates } =
		useTemplatesQuery();
	const { data: exceptions = [], isLoading: isLoadingExceptions } =
		useExceptionsQuery();
	const ordersByDate = useScheduledEventsByDate();
	const saveMutation = useSaveTemplatesMutation();
	const addException = useAddExceptionMutation();
	const deleteException = useDeleteExceptionMutation();

	const [isEditingSchedule, setIsEditingSchedule] = useState(false);
	const [selectedDate, setSelectedDate] = useState(TODAY);

	const hasSchedule = !isLoadingTemplates && (serverTemplates?.length ?? 0) > 0;
	const showSetupModal =
		!isLoadingTemplates &&
		!isLoadingExceptions &&
		(!hasSchedule || isEditingSchedule);

	const techSchedule = useMemo<DaySchedule[]>(() => {
		if (!serverTemplates) return [];
		return ALL_DAYS.map((dayName, index) => {
			const dbEntry = serverTemplates.find((t) => t.day_of_week === index);
			return {
				day_of_week: index,
				dayName,
				enabled: dbEntry ? dbEntry.active : false,
			};
		});
	}, [serverTemplates]);

	const markedDates = useMemo(
		() =>
			buildMarkedDates(
				techSchedule,
				exceptions,
				ordersByDate,
				selectedDate,
				themeColors,
			),
		[techSchedule, exceptions, ordersByDate, selectedDate, themeColors],
	);

	const calendarTheme = useMemo(
		() => getCalendarTheme(themeTokens),
		[themeTokens.id],
	);

	const handleScheduleConfirm = async (newSchedule: DaySchedule[]) => {
		try {
			await saveMutation.mutateAsync({
				newSchedule: newSchedule.map((s) => ({
					day_of_week: s.day_of_week,
					active: s.enabled,
				})),
			});
			setIsEditingSchedule(false);
			setTimeout(
				() =>
					Toast.show({
						type: "success",
						text1: "Schedule updated successfully ✓",
					}),
				350,
			);
		} catch {
			Toast.show({
				type: "error",
				text1: "Failed to update schedule. Try again.",
			});
		}
	};

	const handleMarkUnavailable = async () => {
		try {
			await addException.mutateAsync(selectedDate);
			Toast.show({ type: "success", text1: "Day marked as unavailable ✓" });
		} catch {
			Toast.show({ type: "error", text1: "Failed to mark day. Try again." });
		}
	};

	const handleRemoveOverride = async () => {
		const entry = exceptions.find((e) => e.date === selectedDate);
		if (!entry) return;
		try {
			await deleteException.mutateAsync(entry.id);
			Toast.show({ type: "success", text1: "Override removed ✓" });
		} catch {
			Toast.show({
				type: "error",
				text1: "Failed to remove override. Try again.",
			});
		}
	};

	const onMonthDayPress = useCallback((day: { dateString: string }) => {
		setSelectedDate(day.dateString);
	}, []);

	if (isLoadingTemplates || isLoadingExceptions) {
		return (
			<View className="flex-1 items-center justify-center bg-surface">
				<ActivityIndicator color={themeColors.primary} />
			</View>
		);
	}

	const selectedDayOfWeek = new Date(`${selectedDate}T00:00:00`).getDay();
	const selectedDayName = ALL_DAYS[selectedDayOfWeek];
	const isSelectedDayWorking = techSchedule.some(
		(day) => day.day_of_week === selectedDayOfWeek && day.enabled,
	);
	const isSelectedDateException = exceptions.some(
		(exception) => exception.date === selectedDate,
	);
	const isSelectedDatePast = selectedDate < TODAY;
	const ordersForSelectedDay = ordersByDate[selectedDate] ?? [];
	const canMarkUnavailable =
		!isSelectedDatePast &&
		isSelectedDayWorking &&
		!isSelectedDateException &&
		ordersForSelectedDay.length === 0;

	return (
		<View className="flex-1 bg-surface">
			<ScheduleSetupModal
				visible={showSetupModal}
				onConfirm={handleScheduleConfirm}
				existingSchedule={techSchedule.length ? techSchedule : undefined}
				isLoading={saveMutation.isPending}
				onDismiss={() => {
					if (hasSchedule) {
						setIsEditingSchedule(false);
					} else {
						onDismissSetup();
					}
				}}
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingBottom: spacing.screen.scrollBottomInset,
				}}
			>
				{hasSchedule && (
					<View className="flex-row items-center justify-between px-card pt-card pb-stack-sm">
						<Text variant="h3" className="text-content">
							My Schedule
						</Text>
						<TouchableOpacity
							onPress={() => setIsEditingSchedule(true)}
							className="rounded-input bg-app-primary-light px-stack-md py-control-badge-y"
						>
							<Text
								variant="caption"
								className="font-semibold text-app-primary"
							>
								Edit Schedule
							</Text>
						</TouchableOpacity>
					</View>
				)}

				<View className="mt-stack-sm px-stack-sm">
					<Calendar
						key={themeTokens.id}
						onDayPress={onMonthDayPress}
						markingType="multi-dot"
						markedDates={markedDates}
						minDate={TODAY}
						enableSwipeMonths
						firstDay={0}
						theme={calendarTheme}
					/>
				</View>

				<ScheduleDayPanel
					key={selectedDate}
					selectedDate={selectedDate}
					today={TODAY}
					selectedDayName={selectedDayName}
					isSelectedDatePast={isSelectedDatePast}
					isSelectedDateException={isSelectedDateException}
					isSelectedDayWorking={isSelectedDayWorking}
					canMarkUnavailable={canMarkUnavailable}
					orders={ordersForSelectedDay}
					onMarkUnavailable={handleMarkUnavailable}
					onRemoveOverride={handleRemoveOverride}
					isAddingException={addException.isPending}
					isDeletingException={deleteException.isPending}
				/>

				<ScheduleLegend />
			</ScrollView>
		</View>
	);
}
