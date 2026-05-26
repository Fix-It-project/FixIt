import {
	BottomSheetBackdrop,
	type BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { AxiosError } from "axios";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	useTechRequestReschedule,
	useTechnicianPublicSchedule,
	useAvailabilityMarks,
	useUserRequestReschedule,
} from "@/src/features/booking-orders/hooks";
import { todayIso } from "@/src/features/booking-orders/utils/date-helpers";
import {
	type BookingSlotHour,
	BOOKING_SLOT_OPTIONS,
	buildCairoSlotIsoUtc,
} from "@/src/features/booking-orders/utils/fixed-slots";
import { translateOrderError } from "@/src/features/booking-orders/utils/translate-order-error";
import { useHardwareBackHandler } from "@/src/hooks/useHardwareBackHandler";
import {
	getCalendarTheme,
	radius,
	space,
	spacing,
	useThemeColors,
	useThemeTokens,
} from "@/src/lib/theme";
import ReasonTextarea from "./ReasonTextarea";
import RescheduleSheetHeader from "./RescheduleSheetHeader";

export interface RescheduleSheetHandle {
	open: (input: {
		orderId: string;
		technicianId?: string | null;
		originalScheduledDate?: string | null;
	}) => void;
	close: () => void;
}

export type RescheduleSheetViewer = "user" | "technician";

interface RescheduleSheetProps {
	readonly viewer?: RescheduleSheetViewer;
}

const RescheduleSheet = forwardRef<RescheduleSheetHandle, RescheduleSheetProps>(
	function RescheduleSheet({ viewer = "user" }, ref) {
		const themeColors = useThemeColors();
		const themeTokens = useThemeTokens();
		const sheetRef = useRef<BottomSheetModal>(null);
		const { height: screenHeight } = useWindowDimensions();
		const insets = useSafeAreaInsets();

		const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
		const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
		const [reason, setReason] = useState("");
		const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
		const [currentTechnicianId, setCurrentTechnicianId] = useState<
			string | null
		>(null);
		const [originalScheduledDateIso, setOriginalScheduledDateIso] = useState<
			string | null
		>(null);
		const [visibleMonthIso, setVisibleMonthIso] = useState<string | null>(null);
		const [sheetIndex, setSheetIndex] = useState(-1);

		const userMutation = useUserRequestReschedule();
		const techMutation = useTechRequestReschedule();
		const mutation = viewer === "technician" ? techMutation : userMutation;
		const isSubmitting = mutation.isPending;
		const { templates, exceptions, isLoading: isLoadingAvailability } =
			useTechnicianPublicSchedule(currentTechnicianId);
		const availabilityMarks = useAvailabilityMarks(
			templates,
			exceptions,
			selectedDateIso,
		);

		const calendarTheme = useMemo(
			() => getCalendarTheme(themeTokens),
			[themeTokens],
		);

		const resetState = useCallback(() => {
			setSelectedDateIso(null);
			setSelectedSlot(null);
			setReason("");
			setCurrentOrderId(null);
			setCurrentTechnicianId(null);
			setOriginalScheduledDateIso(null);
			setVisibleMonthIso(null);
			setSheetIndex(-1);
		}, []);

		const closeSheet = useCallback(() => {
			if (isSubmitting) return;
			sheetRef.current?.dismiss();
		}, [isSubmitting]);

		useHardwareBackHandler(sheetIndex >= 0, () => {
			closeSheet();
			return true;
		});

		useImperativeHandle(
			ref,
			() => ({
				open: (input: {
					orderId: string;
					technicianId?: string | null;
					originalScheduledDate?: string | null;
				}) => {
						setCurrentOrderId(input.orderId);
						setCurrentTechnicianId(input.technicianId ?? null);
						setOriginalScheduledDateIso(input.originalScheduledDate ?? null);
						setVisibleMonthIso(input.originalScheduledDate ?? todayIso);
						setSelectedDateIso(null);
						setSelectedSlot(null);
						setReason("");
					setSheetIndex(0);
					sheetRef.current?.present();
				},
				close: () => {
					closeSheet();
				},
			}),
			[closeSheet],
		);

		const exceptionDateSet = useMemo(
			() => new Set(exceptions.map((exception) => exception.date)),
			[exceptions],
		);

		const isDateAvailable = useCallback(
			(dateIso: string): boolean => {
				if (!currentTechnicianId) return false;
				if (exceptionDateSet.has(dateIso)) return false;

				const dayOfWeek = new Date(`${dateIso}T00:00:00`).getDay();
				const dayTemplates = templates.filter((t) => t.day_of_week === dayOfWeek);
				if (dayTemplates.length === 0) return false;

				return dayTemplates.some((template) => template.active);
			},
			[currentTechnicianId, exceptionDateSet, templates],
		);

		const isSlotAvailable = useCallback(
			(dateIso: string, slotHour: BookingSlotHour): boolean => {
				if (!currentTechnicianId) return false;
				if (!isDateAvailable(dateIso)) return false;

				const dayOfWeek = new Date(`${dateIso}T00:00:00`).getDay();
				const dayTemplates = templates.filter((t) => t.day_of_week === dayOfWeek);
				const slotTemplates = dayTemplates.filter((t) => t.slot_hour === slotHour);

				if (slotTemplates.length > 0) {
					return slotTemplates.some((template) => template.active);
				}

				const dayLevelTemplates = dayTemplates.filter(
					(template) => template.slot_hour == null,
				);
				if (dayLevelTemplates.length > 0) {
					return dayLevelTemplates.some((template) => template.active);
				}

				return false;
			},
			[currentTechnicianId, isDateAvailable, templates],
		);

		useEffect(() => {
			if (!selectedDateIso) return;
			if (!isDateAvailable(selectedDateIso)) {
				setSelectedDateIso(null);
				setSelectedSlot(null);
				return;
			}

			if (!selectedSlot) return;
			const picked = BOOKING_SLOT_OPTIONS.find((slot) => slot.value === selectedSlot);
			if (!picked || !isSlotAvailable(selectedDateIso, picked.hour)) {
				setSelectedSlot(null);
			}
		}, [isDateAvailable, isSlotAvailable, selectedDateIso, selectedSlot]);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					pressBehavior={isSubmitting ? "none" : "close"}
					opacity={1}
					style={{ backgroundColor: themeColors.backdrop }}
				/>
			),
			[isSubmitting, themeColors.backdrop],
		);

		const handleDayPress = useCallback(
			(day: DateData) => {
				if (isSubmitting) return;
				if (day.dateString < todayIso) return;
				if (!isDateAvailable(day.dateString)) return;
				setSelectedDateIso(day.dateString);
				setSelectedSlot(null);
			},
			[isDateAvailable, isSubmitting],
		);

		const markedDates = useMemo(() => {
			const baseMarks = currentTechnicianId
				? { ...availabilityMarks }
				: selectedDateIso
					? {
							[selectedDateIso]: {
								selected: true,
								selectedColor: themeColors.primary,
							},
						}
					: {};

			if (originalScheduledDateIso) {
				const existing = baseMarks[originalScheduledDateIso] ?? {};
				baseMarks[originalScheduledDateIso] = {
					...existing,
					marked: true,
					dotColor: themeColors.success,
				};
			}

			return baseMarks;
		}, [
			availabilityMarks,
			currentTechnicianId,
			originalScheduledDateIso,
			selectedDateIso,
			themeColors.primary,
			themeColors.success,
		]);

		const trimmedReason = reason.trim();
		const submitDisabled =
			!currentTechnicianId ||
			!selectedDateIso ||
			!selectedSlot ||
			trimmedReason.length === 0 ||
			!currentOrderId ||
			isSubmitting;

		const handleSubmit = useCallback(() => {
			if (
				!selectedDateIso ||
				!selectedSlot ||
				!currentOrderId ||
				trimmedReason.length === 0
			) {
				return;
			}
			const slot = BOOKING_SLOT_OPTIONS.find((s) => s.value === selectedSlot);
			if (!slot) return;

			const proposedStartAtIso = buildCairoSlotIsoUtc(selectedDateIso, slot.hour);
			mutation.mutate(
				{
					orderId: currentOrderId,
					proposedDateIso: selectedDateIso,
					proposedStartAtIso,
					reason: trimmedReason,
				},
				{
					onSuccess: () => {
						Toast.show({
							type: "success",
							text1: "Reschedule requested",
						});
						sheetRef.current?.dismiss();
						resetState();
					},
					onError: (error) => {
						const axiosErr = error as AxiosError<{ error?: string }>;
						console.warn(
							"[reschedule-error]",
							axiosErr?.response?.status,
							axiosErr?.response?.data,
						);
						Toast.show({
							type: "error",
							text1: "Reschedule rejected",
							text2: translateOrderError(error),
						});
					},
				},
			);
		}, [
			currentOrderId,
			mutation,
			resetState,
			selectedDateIso,
			selectedSlot,
			trimmedReason,
		]);

		return (
			<BottomSheetModal
				ref={sheetRef}
				enableDynamicSizing
				maxDynamicContentSize={screenHeight * 0.9}
				enablePanDownToClose={!isSubmitting}
				keyboardBehavior="interactive"
				keyboardBlurBehavior="restore"
				android_keyboardInputMode="adjustResize"
				backdropComponent={renderBackdrop}
				backgroundStyle={{ backgroundColor: themeColors.surfaceBase }}
				handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
					width: spacing.sheet.handleWidth,
				}}
				onChange={setSheetIndex}
				onDismiss={resetState}
			>
				<BottomSheetScrollView
					className="px-screen-x"
					style={{ backgroundColor: themeColors.surfaceBase }}
					contentContainerStyle={{
						paddingBottom: Math.max(insets.bottom, space[3]) + space[4],
					}}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
				>
					<RescheduleSheetHeader onClose={closeSheet} disabled={isSubmitting} />

					<Calendar
						minDate={todayIso}
						initialDate={visibleMonthIso ?? todayIso}
						onDayPress={handleDayPress}
						onMonthChange={(month) => setVisibleMonthIso(month.dateString)}
						markedDates={markedDates}
						markingType="custom"
						theme={calendarTheme}
					/>
					{!currentTechnicianId ? (
						<View
							style={{
								marginTop: space[2],
								paddingHorizontal: space[2],
								paddingVertical: space[2],
								borderRadius: radius.input,
								backgroundColor: `${themeColors.danger}12`,
							}}
						>
							<Text variant="caption" style={{ color: themeColors.danger }}>
								Could not load technician availability for this reschedule.
							</Text>
						</View>
					) : null}
					{isLoadingAvailability && currentTechnicianId ? (
						<View
							style={{
								marginTop: space[2],
								flexDirection: "row",
								alignItems: "center",
								gap: space[2],
							}}
						>
							<ActivityIndicator size="small" color={themeColors.primary} />
							<Text variant="caption" style={{ color: themeColors.textMuted }}>
								Loading technician availability...
							</Text>
						</View>
					) : null}

					<View className="mt-stack-md">
						<Text variant="buttonMd" className="mb-stack-sm text-content">
							Select Time
						</Text>
						<View className="gap-stack-sm">
							{BOOKING_SLOT_OPTIONS.map((slot) => {
								const slotAvailable = selectedDateIso
									? isSlotAvailable(selectedDateIso, slot.hour)
									: false;
								const slotDisabled =
									isSubmitting ||
									isLoadingAvailability ||
									!selectedDateIso ||
									!slotAvailable;
								const isSelected = selectedSlot === slot.value;
								return (
									<TouchableOpacity
										key={slot.value}
										onPress={() => setSelectedSlot(slot.value)}
										disabled={slotDisabled}
										activeOpacity={0.8}
										className={`rounded-card border px-card py-stack-md ${
											isSelected ? "bg-app-primary-light" : "bg-surface"
										}`}
										style={{
											borderColor: isSelected
												? themeColors.primary
												: themeColors.borderDefault,
											opacity: slotDisabled ? 0.45 : 1,
										}}
									>
										<Text
											variant="buttonMd"
											className={
												isSelected ? "text-app-primary" : "text-content"
											}
										>
											{slot.label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</View>
					</View>

					<ReasonTextarea
						value={reason}
						onChangeText={setReason}
						editable={!isSubmitting}
					/>

					{isSubmitting ? (
						<View
							style={{
								marginTop: space[3],
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								gap: space[2],
								paddingVertical: space[3],
								borderRadius: radius.button,
								backgroundColor: `${themeColors.primary}12`,
							}}
						>
							<ActivityIndicator size="small" color={themeColors.primary} />
							<Text variant="caption" style={{ color: themeColors.primary }}>
								Sending request...
							</Text>
						</View>
					) : null}

					<View className="mt-stack-md">
						<Button
							onPress={handleSubmit}
							size="action"
							className="w-full"
							disabled={submitDisabled}
						>
							{isSubmitting ? (
								<ActivityIndicator
									size="small"
									color={themeColors.surfaceOnPrimary}
								/>
							) : null}
							<Text
								variant="buttonLg"
								style={{ color: themeColors.surfaceOnPrimary }}
							>
								{isSubmitting ? "Sending..." : "Request reschedule"}
							</Text>
						</Button>
					</View>
				</BottomSheetScrollView>
			</BottomSheetModal>
		);
	},
);

export default RescheduleSheet;
