import {
	type ComponentType,
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
	type ScrollViewProps,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import {
	BottomSheet,
	type BottomSheetModalRef,
} from "@/src/components/ui/bottom-sheet";
import { Button } from "@/src/components/ui/button";
import { CalendarPicker } from "@/src/components/ui/calendar-picker";
import { Text } from "@/src/components/ui/text";
import {
	useAvailabilityMarks,
	useTechnicianPublicSchedule,
	useTechRequestReschedule,
	useUserRequestReschedule,
} from "@/src/features/booking-orders/hooks";
import { todayIso } from "@/src/features/booking-orders/utils/date-helpers";
import {
	BOOKING_SLOT_OPTIONS,
	type BookingSlotHour,
	buildCairoSlotIsoUtc,
} from "@/src/features/booking-orders/utils/fixed-slots";
import {
	extractOrderErrorToken,
	translateOrderError,
} from "@/src/features/booking-orders/utils/translate-order-error";
import { logger } from "@/src/lib/logger";
import { radius, space, spacing, useThemeColors } from "@/src/lib/theme";
import ReasonTextarea from "./ReasonTextarea";
import RescheduleSheetHeader from "./RescheduleSheetHeader";

// react-native-keyboard-controller's ScrollViewComponent expects a Reanimated
// forwardRef component. BottomSheet.ScrollView is animated internally; cast
// through any to satisfy the structural forwardRef-marker check.
const KeyboardAwareBottomSheetScrollView =
	BottomSheet.ScrollView as unknown as ComponentType<ScrollViewProps>;

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
		const sheetRef = useRef<BottomSheetModalRef>(undefined as never);
		const { height: screenHeight } = useWindowDimensions();
		const insets = useSafeAreaInsets();

		const [selectedDateIso, setSelectedDateIso] = useState<string>();
		const [selectedSlot, setSelectedSlot] = useState<string>();
		const [reason, setReason] = useState("");
		const [currentOrderId, setCurrentOrderId] = useState<string>();
		const [currentTechnicianId, setCurrentTechnicianId] = useState<string>();
		const [originalScheduledDateIso, setOriginalScheduledDateIso] =
			useState<string>();
		const [visibleMonthIso, setVisibleMonthIso] = useState<string>();

		const userMutation = useUserRequestReschedule();
		const techMutation = useTechRequestReschedule();
		const mutation = viewer === "technician" ? techMutation : userMutation;
		const isSubmitting = mutation.isPending;
		const {
			templates,
			exceptions,
			isLoading: isLoadingAvailability,
		} = useTechnicianPublicSchedule(currentTechnicianId);
		const availabilityMarks = useAvailabilityMarks(
			templates,
			exceptions,
			selectedDateIso,
		);

		const resetState = useCallback(() => {
			setSelectedDateIso(undefined);
			setSelectedSlot(undefined);
			setReason("");
			setCurrentOrderId(undefined);
			setCurrentTechnicianId(undefined);
			setOriginalScheduledDateIso(undefined);
			setVisibleMonthIso(undefined);
		}, []);

		const closeSheet = useCallback(() => {
			if (isSubmitting) return;
			sheetRef.current?.dismiss();
		}, [isSubmitting]);

		useImperativeHandle(
			ref,
			() => ({
				open: (input: {
					orderId: string;
					technicianId?: string | null;
					originalScheduledDate?: string | null;
				}) => {
					setCurrentOrderId(input.orderId);
					setCurrentTechnicianId(input.technicianId ?? undefined);
					setOriginalScheduledDateIso(input.originalScheduledDate ?? undefined);
					setVisibleMonthIso(input.originalScheduledDate ?? todayIso);
					setSelectedDateIso(undefined);
					setSelectedSlot(undefined);
					setReason("");
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
				const dayTemplates = templates.filter(
					(t) => t.day_of_week === dayOfWeek,
				);
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
				const dayTemplates = templates.filter(
					(t) => t.day_of_week === dayOfWeek,
				);
				const slotTemplates = dayTemplates.filter(
					(t) => t.slot_hour === slotHour,
				);

				if (slotTemplates.length > 0) {
					return slotTemplates.some((template) => template.active);
				}

				const dayLevelTemplates = dayTemplates.filter(
					(template) => typeof template.slot_hour !== "number",
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
				setSelectedDateIso(undefined);
				setSelectedSlot(undefined);
				return;
			}

			if (!selectedSlot) return;
			const picked = BOOKING_SLOT_OPTIONS.find(
				(slot) => slot.value === selectedSlot,
			);
			if (!picked || !isSlotAvailable(selectedDateIso, picked.hour)) {
				setSelectedSlot(undefined);
			}
		}, [isDateAvailable, isSlotAvailable, selectedDateIso, selectedSlot]);

		const handleDayPress = useCallback(
			(dateString: string) => {
				if (isSubmitting) return;
				if (dateString < todayIso) return;
				if (!isDateAvailable(dateString)) return;
				setSelectedDateIso(dateString);
				setSelectedSlot(undefined);
			},
			[isDateAvailable, isSubmitting],
		);

		const markedDates = useMemo(() => {
			const baseMarks = currentTechnicianId ? { ...availabilityMarks } : {};

			if (!currentTechnicianId && selectedDateIso) {
				baseMarks[selectedDateIso] = {
					selected: true,
					selectedColor: themeColors.primary,
				};
			}

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

			const proposedStartAtIso = buildCairoSlotIsoUtc(
				selectedDateIso,
				slot.hour,
			);
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
						const responseError = error as {
							response?: { status?: number; data?: unknown };
						};
						logger.warn("reschedule-error", "reschedule failed", {
							orderId: currentOrderId,
							status: responseError.response?.status,
							token: extractOrderErrorToken(error),
						});
						Toast.show({
							type: "info",
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
			<BottomSheet.Modal
				ref={sheetRef}
				enableDynamicSizing
				maxDynamicContentSize={screenHeight * 0.9}
				enablePanDownToClose={!isSubmitting}
				android_keyboardInputMode="adjustResize"
				handleIndicatorStyle={{
					backgroundColor: themeColors.borderDefault,
					width: spacing.sheet.handleWidth,
				}}
				onDismiss={resetState}
			>
				<KeyboardAwareScrollView
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					ScrollViewComponent={KeyboardAwareBottomSheetScrollView as any}
					className="px-screen-x"
					style={{ backgroundColor: themeColors.surfaceBase }}
					contentContainerStyle={{
						paddingBottom: Math.max(insets.bottom, space[3]) + space[4],
					}}
					keyboardShouldPersistTaps="handled"
					keyboardDismissMode="interactive"
					bottomOffset={space[3]}
					extraKeyboardSpace={0}
				>
					<RescheduleSheetHeader onClose={closeSheet} disabled={isSubmitting} />

					<CalendarPicker
						minDate={todayIso}
						initialDate={visibleMonthIso ?? todayIso}
						onDateSelect={handleDayPress}
						onMonthChange={(month: { dateString: string }) =>
							setVisibleMonthIso(month.dateString)
						}
						markedDates={markedDates}
						markingType="custom"
					/>
					{currentTechnicianId ? undefined : (
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
					)}
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
					) : undefined}

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
					) : undefined}

					<View className="mt-stack-md">
						<Button
							onPress={handleSubmit}
							className="w-full"
							disabled={submitDisabled}
						>
							{isSubmitting ? (
								<ActivityIndicator
									size="small"
									color={themeColors.surfaceOnPrimary}
								/>
							) : undefined}
							<Text
								variant="buttonLg"
								style={{ color: themeColors.surfaceOnPrimary }}
							>
								{isSubmitting ? "Sending..." : "Request reschedule"}
							</Text>
						</Button>
					</View>
				</KeyboardAwareScrollView>
			</BottomSheet.Modal>
		);
	},
);

export default RescheduleSheet;
