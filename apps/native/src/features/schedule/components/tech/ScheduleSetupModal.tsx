import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
	BackHandler,
	Modal,
	Pressable,
	ScrollView,
	Switch,
	Text,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Button } from "@/src/components/ui/button";
import type { DaySchedule } from "@/src/features/schedule/types/calendar";
import {
	Colors,
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/lib/theme";

const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((dayName, i) => ({
	day_of_week: i,
	dayName,
	enabled: i >= 0 && i <= 4, // Sun-Thu default
}));

interface Props {
	readonly visible: boolean;
	readonly onConfirm: (schedule: DaySchedule[]) => void;
	readonly onDismiss?: () => void;
	readonly existingSchedule?: DaySchedule[];
	readonly isLoading?: boolean;
}

export default function ScheduleSetupModal({
	visible,
	onConfirm,
	onDismiss,
	existingSchedule,
	isLoading,
}: Props) {
	// If the technician already has a schedule, skip straight to the day-picker.
	// The "choose" step (Default vs Custom) is only for first-time setup.
	const isEditing = !!existingSchedule;
	const [step, setStep] = useState<"choose" | "custom">(
		isEditing ? "custom" : "choose",
	);
	const [schedule, setSchedule] = useState<DaySchedule[]>(
		existingSchedule ?? DEFAULT_SCHEDULE,
	);
	const router = useRouter();
	const { width: screenWidth, height: screenHeight } = useWindowDimensions();
	const themeColors = useThemeColors();

	// Sync state whenever the modal opens or existingSchedule changes.
	useEffect(() => {
		if (visible) {
			const editing = !!existingSchedule;
			setStep(editing ? "custom" : "choose");
			setSchedule(existingSchedule ?? DEFAULT_SCHEDULE);
		}
	}, [visible, existingSchedule]);

	const handleDismiss = useCallback(() => {
		if (step === "custom" && !isEditing) {
			setStep("choose");
			return;
		}

		if (onDismiss) {
			onDismiss();
			return;
		}

		router.back();
	}, [isEditing, onDismiss, router, step]);

	// Android hardware back button
	useEffect(() => {
		if (!visible) return;

		const onBackPress = () => {
			handleDismiss();
			return true;
		};

		const subscription = BackHandler.addEventListener(
			"hardwareBackPress",
			onBackPress,
		);
		return () => subscription.remove();
	}, [handleDismiss, visible]);

	const toggleDay = (index: number) => {
		setSchedule((prev) =>
			prev.map((d, i) => (i === index ? { ...d, enabled: !d.enabled } : d)),
		);
	};

	return (
		<Modal
			visible={visible}
			animationType="fade"
			transparent
			onRequestClose={handleDismiss}
		>
			<View
				className="flex-1 items-center justify-center px-4 py-6"
				style={{ backgroundColor: themeColors.overlayDim }}
			>
				<Pressable className="absolute inset-0" onPress={handleDismiss} />

				<View
					className="w-full overflow-hidden rounded-3xl"
					style={{
						backgroundColor: themeColors.surfaceBase,
						maxWidth: 520,
						maxHeight: Math.min(screenHeight * 0.88, 720),
						width: Math.min(screenWidth - 32, 520),
						...shadowStyle(elevation.modal, {
							shadowColor: Colors.shadow,
							opacity: 0.2,
						}),
					}}
				>
					<ScrollView
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={{ padding: 24, paddingBottom: 28 }}
						showsVerticalScrollIndicator={false}
					>
						<Text className="mb-1 font-bold text-2xl text-content">
							{isEditing ? "Edit Schedule" : "Set Your Schedule"}
						</Text>
						<Text className="mb-6 text-content-muted text-sm">
							Define your weekly availability. It repeats every week.
						</Text>

						{step === "choose" ? (
							<View className="gap-4">
								<TouchableOpacity
									onPress={() => onConfirm(DEFAULT_SCHEDULE)}
									className="rounded-2xl border-2 p-5"
									style={{
										borderColor: Colors.primary,
										backgroundColor: themeColors.primaryLight,
									}}
								>
									<Text
										className="mb-1 font-bold text-base"
										style={{ color: Colors.primary }}
									>
										Default Schedule
									</Text>
									<Text className="text-content-secondary text-sm">
										Sunday – Thursday.{"\n"}
										Applied automatically every week.
									</Text>
								</TouchableOpacity>

								<TouchableOpacity
									onPress={() => setStep("custom")}
									className="rounded-2xl border-2 p-5"
									style={{
										borderColor: themeColors.borderDefault,
										backgroundColor: themeColors.surfaceElevated,
									}}
								>
									<Text className="mb-1 font-bold text-base text-content">
										Custom Schedule
									</Text>
									<Text className="text-content-secondary text-sm">
										Pick your working days.{"\n"}
										Repeats weekly throughout the year.
									</Text>
								</TouchableOpacity>
							</View>
						) : (
							<View>
								<Text className="mt-2 mb-3 font-semibold text-base text-content-secondary">
									Working days
								</Text>

								{schedule.map((item, index) => (
									<View
										key={item.day_of_week}
										className="mb-3 overflow-hidden rounded-2xl"
										style={{
											borderWidth: 1,
											borderColor: item.enabled
												? Colors.primary
												: themeColors.borderDefault,
										}}
									>
										<View
											className="flex-row items-center justify-between px-4 py-3"
											style={{
												backgroundColor: item.enabled
													? themeColors.primaryLight
													: themeColors.surfaceElevated,
											}}
										>
											<Text
												className="font-semibold text-base"
												style={{
													color: item.enabled
														? themeColors.textPrimary
														: themeColors.textMuted,
												}}
											>
												{item.dayName}
											</Text>
											<Switch
												value={item.enabled}
												onValueChange={() => toggleDay(index)}
												trackColor={{
													true: Colors.primary,
													false: themeColors.borderDefault,
												}}
												thumbColor={themeColors.surfaceBase}
											/>
										</View>
									</View>
								))}

								<Button
									onPress={() => onConfirm(schedule)}
									disabled={isLoading}
									size="action"
									className="mt-6 w-full"
									style={{
										backgroundColor: isLoading
											? themeColors.borderDefault
											: Colors.primary,
									}}
								>
									<Text
										className="font-bold text-base"
										style={{
											color: isLoading
												? themeColors.textMuted
												: themeColors.surfaceBase,
										}}
									>
										{isLoading ? "Saving..." : "Save My Schedule"}
									</Text>
								</Button>

								{!isEditing && (
									<TouchableOpacity
										onPress={() => setStep("choose")}
										className="mt-4 mb-2 items-center"
									>
										<Text className="text-content-muted text-sm">Back</Text>
									</TouchableOpacity>
								)}
							</View>
						)}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}
