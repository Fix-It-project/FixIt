import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import BookingFlowHeader from "@/src/features/booking-orders/components/shared/BookingFlowHeader";
import BookingTimeStep from "@/src/features/booking-orders/components/user/BookingTimeStep";
import {
	BOOKING_SLOT_OPTIONS,
	buildCairoSlotIsoUtc,
} from "@/src/features/booking-orders/utils/fixed-slots";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/navigation";

export default function BookingTimeScreen() {
	const {
		technicianId,
		technicianName,
		serviceId,
		serviceName,
		categoryId,
		categoryName,
		selectedDate,
		selectedTime,
	} = useLocalSearchParams<{
		technicianId: string;
		technicianName: string;
		serviceId: string;
		serviceName: string;
		categoryId: string;
		categoryName: string;
		selectedDate: string;
		selectedTime?: string;
	}>();

	const [chosenTime, setChosenTime] = useState<string | null>(selectedTime ?? null);

	const bookingDateRoute = ROUTES.user.bookingDate(technicianId ?? "");
	const goBack = useSafeBack({
		...bookingDateRoute,
		params: {
			...bookingDateRoute.params,
			technicianName,
			serviceId,
			serviceName,
			categoryId,
			categoryName,
		},
	});

	const handleNext = () => {
		if (!technicianId || !selectedDate || !chosenTime) return;

		const selectedOption = BOOKING_SLOT_OPTIONS.find(
			(slot) => slot.value === chosenTime,
		);
		if (!selectedOption) return;

		const scheduledStartAt = buildCairoSlotIsoUtc(
			selectedDate,
			selectedOption.hour,
		);
		const route = ROUTES.user.bookingDetails(technicianId);
		router.push({
			...route,
			params: {
				...route.params,
				technicianName,
				serviceId,
				serviceName,
				categoryId,
				categoryName,
				selectedDate,
				selectedTime: selectedOption.value,
				selectedTimeLabel: selectedOption.label,
				scheduledStartAt,
			},
		});
	};

	return (
		<BookingFlowHeader
			categoryId={categoryId}
			categoryName={categoryName}
			serviceName={serviceName}
			stepLabel="Step 2 of 3 - Select Time"
			technicianName={technicianName}
			onBackPress={goBack}
		>
			<BookingTimeStep
				technicianId={technicianId ?? ""}
				technicianName={technicianName ?? "Technician"}
				selectedDate={selectedDate ?? ""}
				selectedTime={chosenTime}
				onTimeSelect={setChosenTime}
				onNext={handleNext}
			/>
		</BookingFlowHeader>
	);
}
