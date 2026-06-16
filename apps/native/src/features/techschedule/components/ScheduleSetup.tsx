import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import PageHeader from "@/src/components/layout/PageHeader";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Switch } from "@/src/components/ui/switch";
import { Text } from "@/src/components/ui/text";
import { spacing } from "@/src/constants/design-tokens";
import { DAY_NAMES, formatSlotHour, SLOT_HOURS } from "../constants";
import { useCompleteScheduleSetup } from "../hooks/useCompleteScheduleSetup";
import {
	type SaveTemplateRow,
	useSaveScheduleTemplatesMutation,
	useScheduleTemplatesQuery,
} from "../hooks/useScheduleTemplates";

type DaySlots = Record<number, number[]>;

/** First-run + edit both seed from server templates; first-run with none yet
 *  defaults to Sun–Thu on every slot, a sensible full-time starting point. */
function seedSlots(
	templates: readonly {
		day_of_week: number;
		slot_hour?: number | null;
		active: boolean;
	}[],
): DaySlots {
	const map: DaySlots = {};
	for (let d = 0; d < 7; d++) map[d] = [];
	if (templates.length === 0) {
		for (let d = 0; d <= 4; d++) map[d] = [...SLOT_HOURS];
		return map;
	}
	for (const t of templates) {
		if (t.active) map[t.day_of_week].push(t.slot_hour ?? SLOT_HOURS[0]);
	}
	return map;
}

function SetupLoading() {
	return (
		<View className="gap-stack-sm px-screen-x pt-stack-md">
			{[0, 1, 2, 3, 4].map((i) => (
				<Skeleton key={i} className="h-16 w-full rounded-card" />
			))}
		</View>
	);
}

function SlotChip({
	hour,
	active,
	onToggle,
}: {
	readonly hour: number;
	readonly active: boolean;
	readonly onToggle: () => void;
}) {
	return (
		<PressableScale
			pressedScale={0.94}
			onPress={onToggle}
			className={`rounded-pill px-stack-md py-stack-xs ${
				active ? "bg-app-primary" : "bg-surface-elevated"
			}`}
			accessibilityRole="button"
			accessibilityState={{ selected: active }}
		>
			<Text
				variant="caption"
				className={`font-semibold ${
					active ? "text-surface-on-primary" : "text-content-muted"
				}`}
			>
				{formatSlotHour(hour)}
			</Text>
		</PressableScale>
	);
}

function DayCard({
	dow,
	hours,
	onToggleDay,
	onToggleSlot,
}: {
	readonly dow: number;
	readonly hours: number[];
	readonly onToggleDay: () => void;
	readonly onToggleSlot: (hour: number) => void;
}) {
	const enabled = hours.length > 0;
	return (
		<Animated.View layout={LinearTransition.duration(200)}>
			<Card className="gap-stack-sm p-card">
				<View className="flex-row items-center justify-between">
					<View>
						<Text variant="label" className="font-bold text-content">
							{DAY_NAMES[dow]}
						</Text>
						<Text variant="caption" className="text-content-muted">
							{enabled
								? `${hours.length} slot${hours.length === 1 ? "" : "s"}`
								: "Day off"}
						</Text>
					</View>
					<Switch checked={enabled} onCheckedChange={onToggleDay} />
				</View>

				{enabled ? (
					<Animated.View
						entering={FadeIn.duration(180)}
						className="flex-row flex-wrap gap-stack-xs"
					>
						{SLOT_HOURS.map((hour) => (
							<SlotChip
								key={hour}
								hour={hour}
								active={hours.includes(hour)}
								onToggle={() => onToggleSlot(hour)}
							/>
						))}
					</Animated.View>
				) : null}
			</Card>
		</Animated.View>
	);
}

/**
 * Full-screen schedule setup / edit (no modal). Pick working days and the visit
 * slots each offers. Saving writes the weekly template rows then stamps setup
 * complete, so onboarding never returns — even with zero working days.
 */
export function ScheduleSetup() {
	const templatesQuery = useScheduleTemplatesQuery();
	const save = useSaveScheduleTemplatesMutation();
	const complete = useCompleteScheduleSetup();

	const [slots, setSlots] = useState<DaySlots | null>(null);

	useEffect(() => {
		if (slots !== null || templatesQuery.isPending) return;
		setSlots(seedSlots(templatesQuery.data ?? []));
	}, [slots, templatesQuery.isPending, templatesQuery.data]);

	const toggleDay = (dow: number) => {
		setSlots((prev) => {
			if (!prev) return prev;
			const on = prev[dow].length > 0;
			return { ...prev, [dow]: on ? [] : [...SLOT_HOURS] };
		});
	};

	const toggleSlot = (dow: number, hour: number) => {
		setSlots((prev) => {
			if (!prev) return prev;
			const has = prev[dow].includes(hour);
			return {
				...prev,
				[dow]: has ? prev[dow].filter((h) => h !== hour) : [...prev[dow], hour],
			};
		});
	};

	const workingDays = slots
		? Object.values(slots).filter((s) => s.length > 0).length
		: 0;
	const isSaving = save.isPending || complete.isPending;

	const handleSave = async () => {
		if (!slots) return;
		const rows: SaveTemplateRow[] = [];
		for (let dow = 0; dow < 7; dow++) {
			for (const hour of SLOT_HOURS) {
				rows.push({
					day_of_week: dow,
					slot_hour: hour,
					active: slots[dow].includes(hour),
				});
			}
		}
		try {
			await save.mutateAsync(rows);
			await complete.mutateAsync();
			Toast.show({ type: "success", text1: "Schedule saved" });
			router.back();
		} catch {
			// Failure toast handled globally via MutationCache.onError.
		}
	};

	return (
		<View className="flex-1 bg-surface">
			<ScreenStatusBar variant="surface" />
			<ScreenSafeAreaView className="flex-1" edges={["top"]}>
				<PageHeader title="Set up schedule" />

				{slots === null ? (
					<SetupLoading />
				) : (
					<>
						<ScrollView
							showsVerticalScrollIndicator={false}
							contentContainerStyle={{
								padding: spacing.card.padding,
								gap: spacing.stack.sm,
								paddingBottom: spacing.stack.xl,
							}}
						>
							<Text variant="body" className="text-content-secondary">
								Turn on the days you take jobs, then choose the visit times you
								offer. You can change this anytime.
							</Text>
							{DAY_NAMES.map((dayName, dow) => (
								<DayCard
									key={dayName}
									dow={dow}
									hours={slots[dow]}
									onToggleDay={() => toggleDay(dow)}
									onToggleSlot={(hour) => toggleSlot(dow, hour)}
								/>
							))}
						</ScrollView>

						<View
							className="border-border border-t bg-surface px-screen-x pt-stack-md"
							style={{ paddingBottom: spacing.screen.paddingBottom }}
						>
							<Button size="lg" fullWidth loading={isSaving} onPress={handleSave}>
								{workingDays > 0
									? `Save schedule · ${workingDays} day${workingDays === 1 ? "" : "s"}`
									: "Save schedule"}
							</Button>
						</View>
					</>
				)}
			</ScreenSafeAreaView>
		</View>
	);
}
