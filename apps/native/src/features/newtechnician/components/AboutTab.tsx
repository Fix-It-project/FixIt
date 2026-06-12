import {
	Banknote,
	CalendarDays,
	Clock,
	type LucideIcon,
} from "lucide-react-native";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import { BOOKING_SLOT_OPTIONS } from "@/src/features/booking-orders/utils/fixed-slots";

const DAY_KEYS = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat",
] as const;

function hourLabel(hour: number): string {
	const opt = BOOKING_SLOT_OPTIONS.find((o) => o.hour === hour);
	return opt?.label ?? `${hour}:00`;
}

interface InfoRowProps {
	readonly icon: LucideIcon;
	readonly label: string;
	readonly value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row items-start gap-stack-md rounded-input px-stack-sm py-stack-sm">
			<View className="h-avatar-md w-avatar-md items-center justify-center rounded-input bg-app-primary-light">
				<Icon
					size={spacing.icon.sm}
					color={themeColors.primary}
					strokeWidth={2}
				/>
			</View>
			<View className="flex-1">
				<Text variant="caption" className="text-content-muted">
					{label}
				</Text>
				<Text variant="bodySm" className="mt-stack-xs text-content">
					{value}
				</Text>
			</View>
		</View>
	);
}

interface AboutTabProps {
	readonly technicianId: string;
}

export function AboutTab({ technicianId }: AboutTabProps) {
	const { t } = useTranslation("technicians");
	const { templates, isLoading } = useTechnicianPublicSchedule(technicianId);

	const activeDays = useMemo(() => {
		const set = new Set<number>();
		for (const tpl of templates) if (tpl.active) set.add(tpl.day_of_week);
		return [...set].sort((a, b) => a - b);
	}, [templates]);

	const activeHours = useMemo(() => {
		const set = new Set<number>();
		for (const tpl of templates) {
			if (tpl.active && tpl.slot_hour != null) set.add(tpl.slot_hour);
		}
		return [...set].sort((a, b) => a - b);
	}, [templates]);

	const hasSchedule = activeDays.length > 0;

	return (
		<View className="py-stack-md">
			<Text variant="h4" className="text-content">
				{t("about.heading")}
			</Text>

			<View className="mt-stack-lg gap-stack-xs rounded-card bg-card p-stack-xs">
				<InfoRow
					icon={Banknote}
					label={t("about.inspectionFee")}
					value={t("about.inspectionFeeDynamic")}
				/>
				<View className="mx-stack-sm h-px bg-edge/20" />

				{isLoading ? (
					<View className="gap-stack-sm p-stack-sm">
						<Skeleton className="h-12 w-full rounded-input" />
						<Skeleton className="h-12 w-full rounded-input" />
					</View>
				) : hasSchedule ? (
					<>
						<InfoRow
							icon={CalendarDays}
							label={t("about.availableDays")}
							value={activeDays
								.map((d) => t(`about.days.${DAY_KEYS[d]}` as Parameters<typeof t>[0]))
								.join(" · ")}
						/>
						<View className="mx-stack-sm h-px bg-edge/20" />
						<InfoRow
							icon={Clock}
							label={t("about.availableTimes")}
							value={
								activeHours.length > 0
									? activeHours.map(hourLabel).join(" · ")
									: t("about.allHours")
							}
						/>
					</>
				) : (
					<View className="mt-stack-xs rounded-input bg-surface-elevated px-card py-stack-md">
						<Text variant="bodySm" className="text-content-muted">
							{t("about.noSchedule")}
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
