import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import BookingFlowHeader from "@/src/features/booking-orders/components/shared/BookingFlowHeader";
import BookingDetailsStep, {
	type AttachmentInfo,
} from "@/src/features/booking-orders/components/user/BookingDetailsStep";
import { useCreateBookingMutation } from "@/src/features/booking-orders/hooks/useCreateBooking";
import { bookingSchema } from "@/src/features/booking-orders/schemas/form.schema";
import { getErrorMessage } from "@/src/lib/helpers/error-helpers";
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";

export default function BookingDetailsScreen() {
	const {
		technicianId,
		technicianName,
		serviceId,
		serviceName,
		categoryId,
		categoryName,
		selectedDate,
	} = useLocalSearchParams<{
		technicianId: string;
		technicianName: string;
		serviceId: string;
		serviceName: string;
		categoryId: string;
		categoryName: string;
		selectedDate: string;
	}>();

	const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

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

	const handleConfirm = async (
		description: string,
		attachment: AttachmentInfo | null,
	) => {
		if (!technicianId || !selectedDate || !serviceId) return;
		try {
			const payload = bookingSchema.parse({
				technician_id: technicianId,
				service_id: serviceId,
				scheduled_date: selectedDate,
				problem_description: description || undefined,
			});

			await createBooking({ payload, attachment: attachment ?? undefined });

			Toast.show({
				type: "success",
				text1: "Booking submitted pending approval!",
			});
			setTimeout(() => {
				router.dismissAll();
				router.replace(ROUTES.user.home);
			}, 1000);
		} catch (error: unknown) {
			Toast.show({ type: "error", text1: getErrorMessage(error) });
		}
	};

	return (
		<BookingFlowHeader
			categoryId={categoryId}
			categoryName={categoryName}
			serviceName={serviceName}
			stepLabel="Step 2 of 2 - Details"
			technicianName={technicianName}
			onBackPress={goBack}
		>
			<BookingDetailsStep
				selectedDate={selectedDate}
				onBack={goBack}
				onConfirm={handleConfirm}
				isPending={isPending}
			/>
		</BookingFlowHeader>
	);
}
