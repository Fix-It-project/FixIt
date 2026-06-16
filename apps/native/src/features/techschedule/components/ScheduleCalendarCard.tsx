import { ChevronDown } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import {
	Accordion,
	AccordionContent,
	AccordionTrigger,
} from "@/src/components/ui/accordion";
import { AvailabilityCalendar } from "@/src/components/ui/availability-calendar";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import type {
	AvailabilityTemplate,
	CalendarException,
} from "@/src/lib/technician-calendar";
import { useScheduleAccordionStore } from "../stores/accordion-store";
import { ScheduleLegend } from "./ScheduleLegend";
import { WeekStrip } from "./WeekStrip";

interface ScheduleCalendarCardProps {
	readonly templates: readonly AvailabilityTemplate[];
	readonly exceptions: readonly CalendarException[];
	readonly selectedDate: string;
	/** Week shown by the strip — moves with finger swipes, decoupled from selection. */
	readonly weekAnchor: string;
	readonly today: string;
	readonly orderDates: readonly string[];
	readonly availableDayOfWeek: ReadonlySet<number>;
	readonly onSelectDate: (date: string) => void;
	readonly onWeekChange: (anchor: string) => void;
}

export function ScheduleCalendarCard({
	templates,
	exceptions,
	selectedDate,
	weekAnchor,
	today,
	orderDates,
	availableDayOfWeek,
	onSelectDate,
	onWeekChange,
}: ScheduleCalendarCardProps) {
	const { t } = useTranslation("technician");
	const calendarOpen = useScheduleAccordionStore((s) => s.calendarOpen);
	const setCalendarOpen = useScheduleAccordionStore((s) => s.setCalendarOpen);

	const chevron = useSharedValue(calendarOpen ? 1 : 0);
	useEffect(() => {
		chevron.value = withTiming(calendarOpen ? 1 : 0, { duration: 180 });
	}, [calendarOpen, chevron]);
	const chevronStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${chevron.value * 180}deg` }],
	}));

	const exceptionDates = useMemo(
		() => new Set(exceptions.map((e) => e.date)),
		[exceptions],
	);
	const orderDateSet = useMemo(() => new Set(orderDates), [orderDates]);

	return (
		<View className="px-screen-x pt-stack-md">
			<Card className="p-card">
				<WeekStrip
					weekAnchor={weekAnchor}
					selectedDate={selectedDate}
					today={today}
					orderDates={orderDateSet}
					exceptionDates={exceptionDates}
					availableDayOfWeek={availableDayOfWeek}
					onSelect={onSelectDate}
					onWeekChange={onWeekChange}
				/>

				<Accordion
					expanded={calendarOpen}
					onExpandedChange={setCalendarOpen}
					className="mt-stack-sm border-border border-t"
				>
					<AccordionTrigger className="flex-row items-center justify-center gap-1 pt-stack-sm">
						<Text variant="caption" className="font-semibold text-app-primary">
							{calendarOpen
								? t("schedule.hideCalendar")
								: t("schedule.openCalendar")}
						</Text>
						<Animated.View style={chevronStyle}>
							<Icon as={ChevronDown} size={16} className="text-app-primary" />
						</Animated.View>
					</AccordionTrigger>
					<AccordionContent>
						<View className="pt-stack-sm">
							<ScheduleLegend />
							{/* transparent surface → the calendar blends into this card
							    instead of painting its own panel (one cohesive card). */}
							<AvailabilityCalendar
								templates={templates}
								exceptions={exceptions}
								selectedDate={selectedDate}
								onDateSelect={onSelectDate}
								orderDates={orderDates}
								allowUnavailableSelection
								backgroundColor="transparent"
							/>
						</View>
					</AccordionContent>
				</Accordion>
			</Card>
		</View>
	);
}
