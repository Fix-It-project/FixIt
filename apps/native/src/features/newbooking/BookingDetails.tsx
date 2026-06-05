import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Animated, {
	FadeInDown,
	useReducedMotion,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	DUR_SLIDE_UP,
	EASE_OUT_QUART,
	ENTRANCE_STAGGER,
} from "@/src/constants/animation";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useCreateBookingMutation } from "@/src/features/booking-orders/hooks/useCreateBooking";
import { bookingSchema } from "@/src/features/booking-orders/schemas/form.schema";
import {
	BOOKING_SLOT_OPTIONS,
	type BookingSlotHour,
	buildCairoSlotIsoUtc,
} from "@/src/features/booking-orders/utils/fixed-slots";
import { useDebounce } from "@/src/hooks/useDebounce";
import { showError } from "@/src/lib/errors";
import { ROUTES, useSafeBack } from "@/src/lib/navigation";
import {
	type AttachmentInfo,
	BookingProblemCard,
} from "./components/BookingProblemCard";

function getStringParam(value: string | string[] | undefined): string {
	if (Array.isArray(value)) return value[0] ?? "";
	return value ?? "";
}

export default function BookingDetails() {
	const reducedMotion = useReducedMotion();
	const params = useLocalSearchParams<{
		technicianId: string | string[];
		technicianName?: string | string[];
		serviceId?: string | string[];
		serviceName?: string | string[];
		categoryId?: string | string[];
		categoryName?: string | string[];
		selectedDate?: string | string[];
		selectedHour?: string | string[];
	}>();

	const technicianId = getStringParam(params.technicianId);
	const serviceId = getStringParam(params.serviceId);
	const serviceName = getStringParam(params.serviceName);
	const selectedDate = getStringParam(params.selectedDate);
	const selectedHourRaw = getStringParam(params.selectedHour);
	const selectedHour = selectedHourRaw ? Number(selectedHourRaw) : null;

	const [description, setDescription] = useState("");
	const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);

	const {
		data: addresses,
		isError: isAddressError,
		isLoading: isLoadingAddresses,
	} = useAddressesQuery();
	const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

	const selectedAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];
	const selectedTimeLabel = useMemo(
		() =>
			BOOKING_SLOT_OPTIONS.find((slot) => slot.hour === selectedHour)?.label ??
			"",
		[selectedHour],
	);

	const fallbackRoute = ROUTES.user.bookingRoot(technicianId);
	const goBack = useSafeBack(fallbackRoute);
	const canConfirm =
		!!technicianId &&
		!!serviceId &&
		!!selectedDate &&
		selectedHour !== null &&
		!Number.isNaN(selectedHour) &&
		!isPending &&
		!isLoadingAddresses;
	const entering = (index: number) =>
		reducedMotion
			? undefined
			: FadeInDown.delay(index * ENTRANCE_STAGGER)
					.duration(DUR_SLIDE_UP)
					.easing(EASE_OUT_QUART);

	const handleConfirm = useDebounce(async () => {
		if (
			!technicianId ||
			!serviceId ||
			!selectedDate ||
			selectedHour === null ||
			Number.isNaN(selectedHour)
		) {
			Toast.show({ type: "info", text1: "Pick a date and time first." });
			return;
		}
		if (isAddressError) {
			Toast.show({ type: "info", text1: "Unable to load your location." });
			return;
		}
		if (!selectedAddress) {
			Toast.show({ type: "info", text1: "Add a location before booking." });
			return;
		}

		try {
			const scheduledStartAt = buildCairoSlotIsoUtc(
				selectedDate,
				selectedHour as BookingSlotHour,
			);
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
			router.replace(ROUTES.user.home);
			if (createdOrderId) {
				router.push(ROUTES.user.placedOrder(createdOrderId));
			}
		} catch (error: unknown) {
			showError(error);
		}
	}, 600);

	return (
		<ScreenSafeAreaView className="flex-1 bg-app-primary" edges={["top"]}>
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<View className="flex-1 bg-surface">
					<PageHeader
						title="Booking Details"
						subtitle={serviceName || undefined}
						variant="app-primary"
						onBackPress={goBack}
					/>

					<ScrollView
						className="flex-1"
						contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<Animated.View
							entering={entering(0)}
							className="mb-card rounded-card border border-edge bg-card p-card-compact"
						>
							<Text variant="label" className="text-content-secondary">
								Selected appointment
							</Text>
							<Text variant="bodySm" className="mt-stack-xs text-content">
								{selectedDate && selectedTimeLabel
									? `${selectedDate} · ${selectedTimeLabel}`
									: "No date and time selected"}
							</Text>
						</Animated.View>

						<Animated.View entering={entering(1)}>
							<BookingProblemCard
								description={description}
								onDescriptionChange={setDescription}
								attachment={attachment}
								onAttachmentChange={setAttachment}
							/>
						</Animated.View>
					</ScrollView>

					<Animated.View
						entering={entering(2)}
						className="px-card pt-stack-md pb-stack-lg"
					>
						<Button
							disabled={!canConfirm}
							onPress={handleConfirm}
							className="w-full"
							testID="confirm-booking"
						>
							<Text variant="buttonLg" className="text-surface-on-primary">
								{isPending ? "Booking..." : "Confirm Booking"}
							</Text>
						</Button>
					</Animated.View>
				</View>
			</KeyboardAvoidingView>
		</ScreenSafeAreaView>
	);
}
