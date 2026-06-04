import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { AvailabilityCalendar } from "@/src/components/ui/availability-calendar";
import BackButton from "@/src/components/ui/back-button";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
import { useBookedSlots } from "@/src/features/booking-orders/hooks/useBookedSlots";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import { BOOKING_SLOT_OPTIONS } from "@/src/features/booking-orders/utils/fixed-slots";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import { TimeSlotGrid } from "./components/TimeSlotGrid";

export default function NewBooking() {
	const themeColors = useThemeColors();
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

	const selectedTimeLabel = useMemo(
		() =>
			BOOKING_SLOT_OPTIONS.find((s) => s.hour === selectedHour)?.label ?? "",
		[selectedHour],
	);

	const canContinue =
		!!technicianId && !!serviceId && !!selectedDate && selectedHour !== null;

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
		<ScreenSafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: Colors.primary }}
		>
			<View className="flex-1 bg-surface">
				<View
					style={{ backgroundColor: Colors.primary }}
					className="flex-row items-center px-card pt-stack-sm pb-card"
				>
					<BackButton
						variant="header-inverse"
						className="mr-stack-md"
						onPress={goBack}
					/>
					<View className="flex-1">
						<Text
							variant="h3"
							style={{ color: themeColors.onPrimaryHeader }}
							numberOfLines={1}
						>
							Date & Time
						</Text>
						{params.serviceName ? (
							<Text
								variant="caption"
								style={{ color: themeColors.overlayBright }}
								numberOfLines={1}
							>
								{params.serviceName}
							</Text>
						) : null}
					</View>
				</View>

				<ScrollView
					className="flex-1"
					contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					<Text variant="h4" className="mb-stack-sm text-content">
						Select a date
					</Text>
					{scheduleLoading ? (
						<View className="items-center justify-center py-section-y">
							<ActivityIndicator size="large" color={themeColors.primary} />
						</View>
					) : (
						<View className="overflow-hidden rounded-card border border-edge bg-card">
							<AvailabilityCalendar
								templates={templates}
								exceptions={exceptions}
								selectedDate={selectedDate}
								onDateSelect={handleDateSelect}
							/>
						</View>
					)}

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
				</ScrollView>

				<View className="border-edge border-t bg-card px-card pt-stack-md pb-stack-lg">
					{selectedDate && selectedHour !== null ? (
						<Text
							variant="caption"
							className="mb-stack-xs text-content-muted"
							numberOfLines={1}
						>
							{selectedDate} · {selectedTimeLabel}
						</Text>
					) : null}
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
