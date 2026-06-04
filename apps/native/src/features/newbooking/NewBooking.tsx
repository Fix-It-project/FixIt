import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { AvailabilityCalendar } from "@/src/components/ui/availability-calendar";
import BackButton from "@/src/components/ui/back-button";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useBookedSlots } from "@/src/features/booking-orders/hooks/useBookedSlots";
import { useCreateBookingMutation } from "@/src/features/booking-orders/hooks/useCreateBooking";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
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
	const [description, setDescription] = useState("");
	const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);

	const {
		templates,
		exceptions,
		isLoading: scheduleLoading,
	} = useTechnicianPublicSchedule(technicianId);
	const { bookedSlots } = useBookedSlots(technicianId);
	const {
		data: addresses,
		isError: isAddressError,
		isLoading: isLoadingAddresses,
	} = useAddressesQuery();
	const { mutateAsync: createBooking, isPending } = useCreateBookingMutation();

	const selectedAddress =
		addresses?.find((address) => address.is_active) ?? addresses?.[0];

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

	const canConfirm =
		!!selectedDate &&
		selectedHour !== null &&
		!isPending &&
		!isLoadingAddresses;

	const handleConfirm = useDebounce(async () => {
		if (!technicianId || !serviceId || !selectedDate || selectedHour === null) {
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
					{/* ── Header ── */}
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

						<View className="mt-card-roomy">
							<BookingProblemCard
								description={description}
								onDescriptionChange={setDescription}
								attachment={attachment}
								onAttachmentChange={setAttachment}
							/>
						</View>
					</ScrollView>

					{/* ── Sticky confirm ── */}
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
							disabled={!canConfirm}
							onPress={handleConfirm}
							className="w-full"
						>
							<Text variant="buttonLg" className="text-surface-on-primary">
								{isPending ? "Booking…" : "Confirm Booking"}
							</Text>
						</Button>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScreenSafeAreaView>
	);
}
