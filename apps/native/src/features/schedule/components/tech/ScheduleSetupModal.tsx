// Migrated to declarative <Dialog> with <Dialog.Form> in Phase 11 Plan 07.

import { Button } from "@/src/components/ui/button";
import { Dialog } from "@/src/components/ui/dialog";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	spacing,
	useThemeColors,
} from "@/src/constants/design-tokens";
import type { DaySchedule } from "@/src/features/schedule/types/calendar";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ScrollView,
	Switch,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";

const DAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const SLOT_HOURS = [8, 11, 14, 17, 20] as const;

function slotLabel(hour: number): string {
	return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}

const DEFAULT_SCHEDULE: DaySchedule[] = DAYS.map((dayName, i) => ({
	day_of_week: i,
	dayName,
	enabled: i >= 0 && i <= 4, // Sun-Thu default
	slots: SLOT_HOURS.map((hour) => ({
		slot_hour: hour,
		active: i >= 0 && i <= 4,
	})),
}));

interface Props {
	readonly visible: boolean;
	readonly onConfirm: (
		schedule: { day_of_week: number; slot_hour: number; active: boolean }[],
	) => void;
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
	const isEditing = !!existingSchedule;
	const [step, setStep] = useState<"choose" | "custom">(
		isEditing ? "custom" : "choose",
	);
	const [schedule, setSchedule] = useState<DaySchedule[]>(
		existingSchedule ?? DEFAULT_SCHEDULE,
	);
	const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
	const router = useRouter();
	const { width: screenWidth, height: screenHeight } = useWindowDimensions();
	const themeColors = useThemeColors();

	useEffect(() => {
		if (visible) {
			const editing = !!existingSchedule;
			setStep(editing ? "custom" : "choose");
			setSchedule(existingSchedule ?? DEFAULT_SCHEDULE);
			setExpandedDays({
				0: true,
				1: true,
			});
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

	const toggleDay = (index: number) => {
		setSchedule((prev) =>
			prev.map((d, i) => {
				if (i !== index) return d;
				const nextEnabled = !d.enabled;
				return {
					...d,
					enabled: nextEnabled,
					slots: d.slots.map((slot) => ({ ...slot, active: nextEnabled })),
				};
			}),
		);
	};

	const toggleSlot = (dayIndex: number, slotHour: number) => {
		setSchedule((prev) =>
			prev.map((d, i) => {
				if (i !== dayIndex) return d;
				const nextSlots = d.slots.map((slot) =>
					slot.slot_hour === slotHour
						? { ...slot, active: !slot.active }
						: slot,
				);
				return {
					...d,
					slots: nextSlots,
					enabled: nextSlots.some((slot) => slot.active),
				};
			}),
		);
	};

	const toggleExpanded = (dayOfWeek: number) => {
		setExpandedDays((prev) => ({
			...prev,
			[dayOfWeek]: !prev[dayOfWeek],
		}));
	};

	const flattenedSchedule = useMemo(
		() =>
			schedule.flatMap((day) =>
				day.slots.map((slot) => ({
					day_of_week: day.day_of_week,
					slot_hour: slot.slot_hour,
					active: slot.active,
				})),
			),
		[schedule],
	);

	return (
		<Dialog visible={visible} onClose={handleDismiss} dismissible={!isLoading}>
			<Dialog.Header>
				{isEditing ? "Edit Schedule" : "Set Your Schedule"}
			</Dialog.Header>
			<Dialog.Form>
				<ScrollView
					keyboardShouldPersistTaps="handled"
					style={{
						maxHeight: Math.min(screenHeight * 0.6, 500),
						width: Math.min(screenWidth - spacing.screen.paddingX * 2 - 48, 512),
					}}
					showsVerticalScrollIndicator={false}
				>
					<Text variant="bodySm" className="mb-stack-xl text-content-muted">
						Define your weekly availability by day and hour.
					</Text>

					{step === "choose" ? (
						<View className="gap-stack-lg">
							<TouchableOpacity
								onPress={() => onConfirm(flattenedSchedule)}
								className="rounded-card border-selected p-card-roomy"
								style={{
									borderColor: Colors.primary,
									backgroundColor: themeColors.primaryLight,
								}}
							>
								<Text
									variant="buttonLg"
									className="mb-stack-xs"
									style={{ color: Colors.primary }}
								>
									Default Schedule
								</Text>
								<Text variant="bodySm" className="text-content-secondary">
									Sunday – Thursday, all 5 time slots active.
								</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => setStep("custom")}
								className="rounded-card border-selected p-card-roomy"
								style={{
									borderColor: themeColors.borderDefault,
									backgroundColor: themeColors.surfaceElevated,
								}}
							>
								<Text variant="buttonLg" className="mb-stack-xs text-content">
									Custom Schedule
								</Text>
								<Text variant="bodySm" className="text-content-secondary">
									Choose exactly which hours are ON/OFF for each day.
								</Text>
							</TouchableOpacity>
						</View>
					) : (
						<View>
							<Text
								variant="buttonLg"
								className="mt-stack-sm mb-stack-md text-content-secondary"
							>
								Weekly time slots
							</Text>

							{schedule.map((item, index) => {
								const expanded = !!expandedDays[item.day_of_week];
								return (
									<View
										key={item.day_of_week}
										className="mb-stack-md overflow-hidden rounded-card border"
										style={{
											borderColor: item.enabled
												? Colors.primary
												: themeColors.borderDefault,
										}}
									>
										<View
											className="flex-row items-center justify-between px-card py-stack-md"
											style={{
												backgroundColor: item.enabled
													? themeColors.primaryLight
													: themeColors.surfaceElevated,
											}}
										>
											<View className="flex-1">
												<Text
													variant="buttonLg"
													style={{
														color: item.enabled
															? themeColors.textPrimary
															: themeColors.textMuted,
													}}
												>
													{item.dayName}
												</Text>
												<Text variant="caption" className="text-content-muted">
													{item.slots.filter((s) => s.active).length} /{" "}
													{item.slots.length} slots active
												</Text>
											</View>

											<TouchableOpacity
												onPress={() => toggleExpanded(item.day_of_week)}
												className="mr-stack-sm rounded-input border border-edge px-stack-md py-control-badge-y"
											>
												<Text variant="caption" className="text-content">
													{expanded ? "Hide" : "Hours"}
												</Text>
											</TouchableOpacity>

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

										{expanded ? (
											<View className="px-card pb-stack-md">
												<View className="mt-stack-sm flex-row flex-wrap gap-stack-sm">
													{item.slots.map((slot) => (
														<TouchableOpacity
															key={`${item.day_of_week}-${slot.slot_hour}`}
															onPress={() =>
																toggleSlot(index, slot.slot_hour)
															}
															className={`rounded-input border px-stack-md py-stack-sm ${
																slot.active
																	? "bg-app-primary-light"
																	: "bg-surface"
															}`}
															style={{
																borderColor: slot.active
																	? Colors.primary
																	: themeColors.borderDefault,
															}}
														>
															<Text
																variant="caption"
																className={
																	slot.active
																		? "font-semibold text-app-primary"
																		: "text-content-muted"
																}
															>
																{slotLabel(slot.slot_hour)}
															</Text>
														</TouchableOpacity>
													))}
												</View>
											</View>
										) : null}
									</View>
								);
							})}

							{!isEditing && (
								<TouchableOpacity
									onPress={() => setStep("choose")}
									className="mt-stack-lg mb-stack-sm items-center"
								>
									<Text variant="bodySm" className="text-content-muted">
										Back
									</Text>
								</TouchableOpacity>
							)}
						</View>
					)}
				</ScrollView>
			</Dialog.Form>
			<Dialog.Footer>
				<Button variant="secondary" onPress={handleDismiss} disabled={isLoading}>
					Cancel
				</Button>
				{step === "custom" || isEditing ? (
					<Button
						variant="primary"
						onPress={() => onConfirm(flattenedSchedule)}
						disabled={isLoading}
						loading={isLoading}
					>
						{isLoading ? "Saving..." : "Save My Schedule"}
					</Button>
				) : null}
			</Dialog.Footer>
		</Dialog>
	);
}