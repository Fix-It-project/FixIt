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
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { ActivityIndicator, useWindowDimensions, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	useTechRequestReschedule,
	useUserRequestReschedule,
} from "@/src/features/booking-orders/hooks";
import { todayIso } from "@/src/features/booking-orders/utils/date-helpers";
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
	open: (orderId: string) => void;
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
		const [reason, setReason] = useState("");
		const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
		const [sheetIndex, setSheetIndex] = useState(-1);

		const userMutation = useUserRequestReschedule();
		const techMutation = useTechRequestReschedule();
		const mutation = viewer === "technician" ? techMutation : userMutation;
		const isSubmitting = mutation.isPending;

		const calendarTheme = useMemo(
			() => getCalendarTheme(themeTokens),
			[themeTokens],
		);

		const resetState = useCallback(() => {
			setSelectedDateIso(null);
			setReason("");
			setCurrentOrderId(null);
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
				open: (orderId: string) => {
					setCurrentOrderId(orderId);
					setSelectedDateIso(null);
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
				setSelectedDateIso(day.dateString);
			},
			[isSubmitting],
		);

		const markedDates = useMemo(() => {
			if (!selectedDateIso) return {};
			return {
				[selectedDateIso]: {
					selected: true,
					selectedColor: themeColors.primary,
				},
			};
		}, [selectedDateIso, themeColors.primary]);

		const trimmedReason = reason.trim();
		const submitDisabled =
			!selectedDateIso ||
			trimmedReason.length === 0 ||
			!currentOrderId ||
			isSubmitting;

		const handleSubmit = useCallback(() => {
			if (!selectedDateIso || !currentOrderId || trimmedReason.length === 0) {
				return;
			}
			mutation.mutate(
				{
					orderId: currentOrderId,
					proposedDateIso: selectedDateIso,
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
		}, [currentOrderId, mutation, resetState, selectedDateIso, trimmedReason]);

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
						onDayPress={handleDayPress}
						markedDates={markedDates}
						theme={calendarTheme}
					/>

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
