// Full-page reschedule flow (replaces the old RescheduleSheet bottom sheet).
//
// Rendering the reason field on a plain page — outside the @rn-primitives/portal
// render path the bottom sheet used — is the fix for the Android text-duplication
// glitch documented in CANCEL_REASON_MODAL_DEBUG.md.
//
// The reason is optional in the UI but still required by the server, so a
// localized default is sent when the note is left blank.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { AvailabilityCalendar } from "@/src/components/ui/availability-calendar";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";
import {
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

const REASON_MIN_HEIGHT = 96;
const REASON_MAX_HEIGHT = 180;

export type RescheduleScreenViewer = "user" | "technician";

interface RescheduleScreenProps {
	readonly viewer: RescheduleScreenViewer;
	readonly orderId: string;
	readonly technicianId?: string | null;
	readonly onDone: () => void;
}

export default function RescheduleScreen({
	viewer,
	orderId,
	technicianId,
	onDone,
}: RescheduleScreenProps) {
	const { t: tr } = useTranslation("orders");
	const themeColors = useThemeColors();
	const insets = useSafeAreaInsets();

	const [selectedDateIso, setSelectedDateIso] = useState<string>();
	const [selectedSlot, setSelectedSlot] = useState<string>();
	const [reason, setReason] = useState("");
	const [reasonHeight, setReasonHeight] = useState(REASON_MIN_HEIGHT);

	const userMutation = useUserRequestReschedule();
	const techMutation = useTechRequestReschedule();
	const mutation = viewer === "technician" ? techMutation : userMutation;
	const isSubmitting = mutation.isPending;
	const resolvedTechnicianId = technicianId || undefined;
	const {
		templates,
		exceptions,
		isLoading: isLoadingAvailability,
	} = useTechnicianPublicSchedule(resolvedTechnicianId);

	const exceptionDateSet = useMemo(
		() => new Set(exceptions.map((exception) => exception.date)),
		[exceptions],
	);

	const isDateAvailable = useCallback(
		(dateIso: string): boolean => {
			if (!resolvedTechnicianId) return false;
			if (exceptionDateSet.has(dateIso)) return false;

			const dayOfWeek = new Date(`${dateIso}T00:00:00`).getDay();
			const dayTemplates = templates.filter((t) => t.day_of_week === dayOfWeek);
			if (dayTemplates.length === 0) return false;

			return dayTemplates.some((template) => template.active);
		},
		[resolvedTechnicianId, exceptionDateSet, templates],
	);

	const isSlotAvailable = useCallback(
		(dateIso: string, slotHour: BookingSlotHour): boolean => {
			if (!resolvedTechnicianId) return false;
			if (!isDateAvailable(dateIso)) return false;

			const dayOfWeek = new Date(`${dateIso}T00:00:00`).getDay();
			const dayTemplates = templates.filter((t) => t.day_of_week === dayOfWeek);
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
		[resolvedTechnicianId, isDateAvailable, templates],
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

	const submitDisabled =
		!resolvedTechnicianId ||
		!selectedDateIso ||
		!selectedSlot ||
		!orderId ||
		isSubmitting;

	const handleSubmit = useCallback(() => {
		if (!selectedDateIso || !selectedSlot || !orderId) return;
		const slot = BOOKING_SLOT_OPTIONS.find((s) => s.value === selectedSlot);
		if (!slot) return;

		const trimmedReason = reason.trim();
		// Reason is optional in the UI but required by the server — fall back to a
		// localized default so blank notes still submit.
		const finalReason =
			trimmedReason.length > 0
				? trimmedReason
				: tr(
						viewer === "technician"
							? "detail.reschedule.defaultReasonTech"
							: "detail.reschedule.defaultReasonUser",
					);
		const proposedStartAtIso = buildCairoSlotIsoUtc(selectedDateIso, slot.hour);

		mutation.mutate(
			{
				orderId,
				proposedDateIso: selectedDateIso,
				proposedStartAtIso,
				reason: finalReason,
			},
			{
				onSuccess: () => {
					Toast.show({
						type: "success",
						text1: tr("detail.reschedule.toastRequested"),
					});
					onDone();
				},
				onError: (error) => {
					const responseError = error as {
						response?: { status?: number; data?: unknown };
					};
					logger.warn("reschedule-error", "reschedule failed", {
						orderId,
						status: responseError.response?.status,
						token: extractOrderErrorToken(error),
					});
					Toast.show({
						type: "info",
						text1: tr("detail.reschedule.toastRejected"),
						text2: translateOrderError(error),
					});
				},
			},
		);
	}, [
		orderId,
		mutation,
		onDone,
		reason,
		selectedDateIso,
		selectedSlot,
		tr,
		viewer,
	]);

	return (
		<ScreenSafeAreaView edges={["top"]} className="flex-1 bg-surface">
			<PageHeader
				title={tr("detail.reschedule.pageTitle")}
				subtitle={tr("detail.reschedule.pageSubtitle")}
				variant="surface"
				onBackPress={onDone}
			/>
			<KeyboardAwareScrollView
				className="flex-1 px-screen-x"
				contentContainerStyle={{
					paddingTop: space[3],
					paddingBottom: space[6],
				}}
				keyboardShouldPersistTaps="handled"
				keyboardDismissMode="interactive"
				bottomOffset={space[3]}
			>
				<AvailabilityCalendar
					templates={templates}
					exceptions={exceptions}
					selectedDate={selectedDateIso}
					onDateSelect={handleDayPress}
					permissiveWhenEmpty={!resolvedTechnicianId}
				/>

				{!resolvedTechnicianId ? (
					<View
						style={{
							marginTop: space[2],
							padding: space[2],
							borderRadius: radius.input,
							backgroundColor: `${themeColors.danger}12`,
						}}
					>
						<Text variant="caption" style={{ color: themeColors.danger }}>
							{tr("detail.reschedule.availabilityError")}
						</Text>
					</View>
				) : null}

				{isLoadingAvailability && resolvedTechnicianId ? (
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
							{tr("detail.reschedule.availabilityLoading")}
						</Text>
					</View>
				) : null}

				<View className="mt-stack-md">
					<Text variant="buttonMd" className="mb-stack-sm text-content">
						{tr("detail.reschedule.selectTime")}
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
									activeOpacity={0.85}
									className={`rounded-card px-card py-stack-md ${
										isSelected ? "bg-app-primary-light" : "bg-surface-elevated"
									}`}
									style={{ opacity: slotDisabled ? 0.45 : 1 }}
								>
									<Text
										variant="buttonMd"
										className={isSelected ? "text-app-primary" : "text-content"}
									>
										{slot.label}
									</Text>
								</TouchableOpacity>
							);
						})}
					</View>
				</View>

				<View className="mt-stack-md">
					<Text variant="buttonMd" className="mb-stack-sm text-content">
						{tr("detail.reschedule.reasonOptional")}
					</Text>
					<Textarea
						value={reason}
						onChangeText={setReason}
						placeholder={tr("detail.reschedule.reasonPlaceholder")}
						editable={!isSubmitting}
						autoComplete="off"
						autoCorrect={false}
						spellCheck={false}
						onContentSizeChange={(e) => {
							const next = e.nativeEvent.contentSize.height;
							setReasonHeight(
								Math.min(REASON_MAX_HEIGHT, Math.max(REASON_MIN_HEIGHT, next)),
							);
						}}
						style={{ height: reasonHeight, maxHeight: REASON_MAX_HEIGHT }}
						className="bg-surface-elevated"
					/>
				</View>
			</KeyboardAwareScrollView>

			<View
				className="px-screen-x"
				style={{
					paddingTop: space[3],
					paddingBottom: Math.max(insets.bottom, space[3]),
					backgroundColor: themeColors.surfaceBase,
				}}
			>
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
					) : null}
					<Text
						variant="buttonLg"
						style={{ color: themeColors.surfaceOnPrimary }}
					>
						{isSubmitting
							? tr("detail.reschedule.sending")
							: tr("detail.reschedule.submit")}
					</Text>
				</Button>
			</View>
		</ScreenSafeAreaView>
	);
}
