import { router } from "expo-router";
import { Pencil } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Icon } from "@/src/components/ui/icon";
import { Skeleton } from "@/src/components/ui/skeleton";
import { DUR_SLIDE_UP, ENTRANCE_STAGGER } from "@/src/constants/animation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation";
import {
	useAddScheduleExceptionMutation,
	useDeleteScheduleExceptionMutation,
	useScheduleExceptionsQuery,
} from "../hooks/useScheduleExceptions";
import { useScheduleTemplatesQuery } from "../hooks/useScheduleTemplates";
import { useTechnicianScheduleOrders } from "../hooks/useTechnicianScheduleOrders";
import { cairoTodayYmd, dayOfWeek } from "../utils/date";
import { ScheduleCalendarCard } from "./ScheduleCalendarCard";
import { ScheduleDayPanel } from "./ScheduleDayPanel";

interface SchedulePageProps {
	/** Preselect a day (from the "View in schedule" deep-link, `?date`). */
	readonly initialDate?: string;
}

function ScheduleLoading() {
	return (
		<View className="gap-stack-md px-screen-x pt-stack-md">
			<Skeleton className="h-40 w-full rounded-card" />
			<Skeleton className="h-24 w-full rounded-card" />
			<Skeleton className="h-24 w-full rounded-card" />
		</View>
	);
}

/**
 * The technician's day-to-day schedule: a finger-swipeable week strip with an
 * accordion month calendar, plus a panel for the selected day (its bookings, or
 * mark/un-mark unavailable). Editing the weekly template is a floating action
 * button (bottom-right), kept within thumb reach. The top inset is owned by the
 * tabs frame, so this screen does not wrap its own safe area.
 */
export function SchedulePage({ initialDate }: SchedulePageProps) {
	const themeColors = useThemeColors();
	const today = useMemo(() => cairoTodayYmd(), []);
	const [selectedDate, setSelectedDate] = useState(initialDate ?? today);
	// The strip's week moves with finger swipes independently of the selection,
	// so browsing ahead never loses the day the technician is looking at.
	const [weekAnchor, setWeekAnchor] = useState(initialDate ?? today);

	const templatesQuery = useScheduleTemplatesQuery();
	const exceptionsQuery = useScheduleExceptionsQuery();
	const ordersQuery = useTechnicianScheduleOrders();

	const templates = useMemo(
		() => templatesQuery.data ?? [],
		[templatesQuery.data],
	);
	const exceptions = useMemo(
		() => exceptionsQuery.data ?? [],
		[exceptionsQuery.data],
	);

	const availableDayOfWeek = useMemo(() => {
		const set = new Set<number>();
		for (const t of templates) if (t.active) set.add(t.day_of_week);
		return set;
	}, [templates]);

	const addException = useAddScheduleExceptionMutation();
	const deleteException = useDeleteScheduleExceptionMutation();

	const handleSelectDate = useCallback((date: string) => {
		setSelectedDate(date);
		setWeekAnchor(date);
	}, []);

	const handleMarkUnavailable = useCallback(() => {
		addException.mutate(selectedDate, {
			onSuccess: () =>
				Toast.show({ type: "success", text1: "Day marked unavailable" }),
		});
	}, [addException, selectedDate]);

	const selectedException = useMemo(
		() => exceptions.find((e) => e.date === selectedDate) ?? null,
		[exceptions, selectedDate],
	);

	const handleRemoveException = useCallback(() => {
		if (!selectedException) return;
		deleteException.mutate(selectedException.id, {
			onSuccess: () =>
				Toast.show({ type: "success", text1: "Day is available again" }),
		});
	}, [deleteException, selectedException]);

	const ordersForDay = ordersQuery.ordersByDate[selectedDate] ?? [];
	const isWorkingDay = availableDayOfWeek.has(dayOfWeek(selectedDate));
	const isLoading = templatesQuery.isPending || exceptionsQuery.isPending;

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />
			<PageHeader
				title="Schedule"
				showBackButton={false}
				className="border-b-0"
			/>

			{isLoading ? (
				<ScheduleLoading />
			) : (
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{
						paddingBottom: spacing.screen.scrollBottomInset,
					}}
				>
					<Animated.View entering={FadeInDown.duration(DUR_SLIDE_UP)}>
						<ScheduleCalendarCard
							templates={templates}
							exceptions={exceptions}
							selectedDate={selectedDate}
							weekAnchor={weekAnchor}
							today={today}
							orderDates={ordersQuery.orderDates}
							availableDayOfWeek={availableDayOfWeek}
							onSelectDate={handleSelectDate}
							onWeekChange={setWeekAnchor}
						/>
					</Animated.View>

					{/* Keyed by the selected day so the reveal re-fires on every pick. */}
					<Animated.View
						key={selectedDate}
						entering={FadeInDown.duration(DUR_SLIDE_UP).delay(ENTRANCE_STAGGER)}
					>
						<ScheduleDayPanel
							selectedDate={selectedDate}
							today={today}
							orders={ordersForDay}
							isWorkingDay={isWorkingDay}
							exceptionId={selectedException?.id ?? null}
							onMarkUnavailable={handleMarkUnavailable}
							onRemoveException={handleRemoveException}
							isMutating={addException.isPending || deleteException.isPending}
						/>
					</Animated.View>
				</ScrollView>
			)}

			<PressableScale
				pressedScale={0.92}
				onPress={() => router.push(ROUTES.technician.scheduleSetup)}
				className="absolute h-14 w-14 items-center justify-center rounded-full bg-app-primary"
				style={{
					right: spacing.screen.paddingX,
					bottom: spacing.stack.lg,
					shadowColor: themeColors.shadow,
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.25,
					shadowRadius: 8,
					elevation: 6,
				}}
				accessibilityRole="button"
				accessibilityLabel="Edit schedule"
			>
				<Icon as={Pencil} size={22} className="text-surface-on-primary" />
			</PressableScale>
		</View>
	);
}
