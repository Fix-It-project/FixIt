import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import BackButton from "@/src/components/ui/back-button";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
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
	const themeColors = useThemeColors();
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
		<ScreenSafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: Colors.primary }}
		>
			<KeyboardAvoidingView
				className="flex-1"
				behavior={Platform.OS === "ios" ? "padding" : undefined}
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
								Booking Details
							</Text>
							{serviceName ? (
								<Text
									variant="caption"
									style={{ color: themeColors.overlayBright }}
									numberOfLines={1}
								>
									{serviceName}
								</Text>
							) : null}
						</View>
					</View>

					<ScrollView
						className="flex-1"
						contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
						keyboardShouldPersistTaps="handled"
						showsVerticalScrollIndicator={false}
					>
						<View className="mb-card rounded-card border border-edge bg-card p-card-compact">
							<Text variant="label" className="text-content-secondary">
								Selected appointment
							</Text>
							<Text variant="bodySm" className="mt-stack-xs text-content">
								{selectedDate && selectedTimeLabel
									? `${selectedDate} · ${selectedTimeLabel}`
									: "No date and time selected"}
							</Text>
						</View>

						<BookingProblemCard
							description={description}
							onDescriptionChange={setDescription}
							attachment={attachment}
							onAttachmentChange={setAttachment}
						/>
					</ScrollView>

					<View className="border-edge border-t bg-card px-card pt-stack-md pb-stack-lg">
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
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScreenSafeAreaView>
	);
}
