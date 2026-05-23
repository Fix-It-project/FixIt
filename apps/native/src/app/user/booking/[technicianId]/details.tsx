import { router, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
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
		selectedTime,
		selectedTimeLabel,
		scheduledStartAt,
	} = useLocalSearchParams<{
		technicianId: string;
		technicianName: string;
		serviceId: string;
		serviceName: string;
		categoryId: string;
		categoryName: string;
		selectedDate: string;
		selectedTime: string;
		selectedTimeLabel: string;
		scheduledStartAt: string;
	}>();

	const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();
	const {
		data: addresses,
		isError: isAddressError,
		isLoading: isLoadingAddresses,
	} = useAddressesQuery();
	const selectedAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];

	const bookingTimeRoute = ROUTES.user.bookingTime(technicianId ?? "");
	const goBack = useSafeBack({
		...bookingTimeRoute,
		params: {
			...bookingTimeRoute.params,
			technicianName,
			serviceId,
			serviceName,
			categoryId,
			categoryName,
			selectedDate,
			selectedTime,
		},
	});

	const handleConfirm = async (
		description: string,
		attachment: AttachmentInfo | null,
	) => {
		if (!technicianId || !selectedDate || !serviceId || !scheduledStartAt)
			return;
		if (isLoadingAddresses) {
			Toast.show({ type: "info", text1: "Loading your saved location..." });
			return;
		}
		if (isAddressError) {
			Toast.show({ type: "error", text1: "Unable to load your location." });
			return;
		}
		if (!selectedAddress) {
			Toast.show({ type: "error", text1: "Add a location before booking." });
			return;
		}
		try {
			const payload = bookingSchema.parse({
				technician_id: technicianId,
				service_id: serviceId,
				scheduled_date: selectedDate,
				scheduled_start_at: scheduledStartAt,
				problem_description: description || undefined,
				destination_address_id: selectedAddress.id,
			});

			const result = await createBooking({
				payload,
				attachment: attachment ?? undefined,
			});

			const createdOrderId = result?.data?.id;
			// Exit the booking Stack group cleanly so Android hardware back
			// from the "order placed" screen (or its order-detail follow-up) does
			// NOT walk back into booking/[technicianId]/details|date|index.
			// `router.dismissAll()` only dismisses modal stacks; for a nested
			// Stack group we replace into the user tab root first, then push the
			// success screen on top of that clean stack.
			router.replace(ROUTES.user.home);
			if (createdOrderId) {
				router.push(ROUTES.user.placedOrder(createdOrderId));
			}
		} catch (error: unknown) {
			Toast.show({ type: "error", text1: getErrorMessage(error) });
		}
	};

	return (
		<BookingFlowHeader
			categoryId={categoryId}
			categoryName={categoryName}
			serviceName={serviceName}
			stepLabel="Step 3 of 3 - Details"
			technicianName={technicianName}
			onBackPress={goBack}
		>
			<BookingDetailsStep
				selectedDate={selectedDate}
				selectedTimeLabel={selectedTimeLabel}
				onBack={goBack}
				onConfirm={handleConfirm}
				isPending={isPending || isLoadingAddresses}
			/>
		</BookingFlowHeader>
	);
}
