import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import BookingFlowHeader from "@/src/features/booking-orders/components/shared/BookingFlowHeader";
import BookingDateStep from "@/src/features/booking-orders/components/user/BookingDateStep";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function BookingDateScreen() {
	const {
		technicianId,
		technicianName,
		serviceId,
		serviceName,
		categoryId,
		categoryName,
	} = useLocalSearchParams<{
		technicianId: string;
		technicianName: string;
		serviceId: string;
		serviceName: string;
		categoryId: string;
		categoryName: string;
	}>();

	const [selectedDate, setSelectedDate] = useState<string | null>(null);

	const goBack = useSafeBack({
		pathname: ROUTES.user.technicians,
		params: { categoryId, categoryName, serviceId, serviceName },
	});

	const handleNext = () => {
		if (!selectedDate) return;
		const route = ROUTES.user.bookingDetails(technicianId ?? "");
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
			},
		});
	};

	return (
		<BookingFlowHeader
			categoryId={categoryId}
			categoryName={categoryName}
			serviceName={serviceName}
			stepLabel="Step 1 of 2 - Select Date"
			technicianName={technicianName}
			onBackPress={goBack}
		>
			<BookingDateStep
				technicianId={technicianId ?? ""}
				technicianName={technicianName ?? ""}
				selectedDate={selectedDate}
				onDateSelect={setSelectedDate}
				onNext={handleNext}
			/>
		</BookingFlowHeader>
	);
}
