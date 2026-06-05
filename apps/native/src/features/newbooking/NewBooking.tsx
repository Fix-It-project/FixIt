import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { AvailabilityCalendar } from "@/src/components/ui/availability-calendar";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLIDE_UP,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { useThemeColors } from "@/src/constants/design-tokens";
import { useBookedSlots } from "@/src/features/booking-orders/hooks/useBookedSlots";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import { TimeSlotGrid } from "./components/TimeSlotGrid";

export default function NewBooking() {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const params = useLocalSearchParams<{
		technicianId: string;
		technicianName?: string;
		serviceId?: string;
		serviceName?: string;
		categoryId?: string;
		categoryName?: string;
	}>();
	const { technicianId, serviceId } = params;

	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [selectedHour, setSelectedHour] = useState<number | null>(null);

	const {
		templates,
		exceptions,
		isLoading: scheduleLoading,
	} = useTechnicianPublicSchedule(technicianId);
	const { bookedSlots } = useBookedSlots(technicianId);

	const goBack = useSafeBack(ROUTES.user.technicianDetail(technicianId ?? ""));

	const handleDateSelect = useCallback((date: string) => {
		setSelectedDate(date);
		setSelectedHour(null);
	}, []);

	const canContinue =
		!!technicianId && !!serviceId && !!selectedDate && selectedHour !== null;
	const entering = (index: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(index * ENTRANCE_STAGGER)
					.duration(DUR_SLIDE_UP)
					.easing(EASE_OUT_QUART);

	const handleContinue = useDebounce(() => {
		if (!technicianId || !serviceId || !selectedDate || selectedHour === null) {
			return;
		}
		const route = ROUTES.user.bookingDetails(technicianId);
		router.push({
			...route,
			params: {
				...route.params,
				serviceId,
				serviceName: params.serviceName,
				technicianName: params.technicianName,
				categoryId: params.categoryId,
				categoryName: params.categoryName,
				selectedDate,
				selectedHour: String(selectedHour),
			},
		} as never);
	}, 600);

	return (
		<ScreenSafeAreaView className="flex-1 bg-app-primary" edges={["top"]}>
			<View className="flex-1 bg-surface">
				<PageHeader
					title="Date & Time"
					subtitle={params.serviceName}
					variant="app-primary"
					onBackPress={goBack}
				/>

				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Animated.View entering={entering(0)}>
						<Text variant="h4" className="mb-stack-sm text-content">
							Select a date
						</Text>
					</Animated.View>
					{scheduleLoading ? (
						<View className="items-center justify-center py-section-y">
							<ActivityIndicator size="large" color={themeColors.primary} />
						</View>
					) : (
						<Animated.View
							entering={entering(1)}
							className="overflow-hidden rounded-card border border-edge bg-card"
						>
							<AvailabilityCalendar
								templates={templates}
								exceptions={exceptions}
								selectedDate={selectedDate}
								onDateSelect={handleDateSelect}
							/>
						</Animated.View>
					)}

					<Animated.View entering={entering(2)}>
						<Text variant="h4" className="mt-card mb-stack-sm text-content">
							Select a time
						</Text>
						<TimeSlotGrid
							selectedDate={selectedDate}
							templates={templates}
							exceptions={exceptions}
							bookedSlots={bookedSlots}
							selectedHour={selectedHour}
							onSelect={setSelectedHour}
						/>
					</Animated.View>
				</ScrollView>

				<View className="px-card pt-stack-md pb-stack-lg">
					<Button
						disabled={!canContinue}
						onPress={handleContinue}
						className="w-full"
						testID="continue-booking"
					>
						<Text variant="buttonLg" className="text-surface-on-primary">
							Continue
						</Text>
					</Button>
				</View>
			</View>
		</ScreenSafeAreaView>
	);
}
