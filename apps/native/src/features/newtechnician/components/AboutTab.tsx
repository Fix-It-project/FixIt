import { CalendarDays, Clock, Phone } from "lucide-react-native";
import { useMemo } from "react";
import { View } from "react-native";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Text } from "@/src/components/ui/text";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";
import { useTechnicianPublicSchedule } from "@/src/features/booking-orders/hooks/usePublicSchedule";
import { BOOKING_SLOT_OPTIONS } from "@/src/features/booking-orders/utils/fixed-slots";
import type { TechnicianProfile } from "@/src/features/technicians/schemas/response.schema";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function hourLabel(hour: number): string {
	const opt = BOOKING_SLOT_OPTIONS.find((o) => o.hour === hour);
	return opt?.label ?? `${hour}:00`;
}

interface InfoRowProps {
	readonly icon: typeof Phone;
	readonly label: string;
	readonly value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-row items-start gap-stack-md py-stack-sm">
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
	readonly profile: TechnicianProfile;
}

export function AboutTab({ technicianId, profile }: AboutTabProps) {
	const { templates, isLoading } = useTechnicianPublicSchedule(technicianId);

	const activeDays = useMemo(() => {
		const set = new Set<number>();
		for (const t of templates) if (t.active) set.add(t.day_of_week);
		return [...set].sort((a, b) => a - b);
	}, [templates]);

	const activeHours = useMemo(() => {
		const set = new Set<number>();
		for (const t of templates) {
			if (t.active && t.slot_hour != null) set.add(t.slot_hour);
		}
		return [...set].sort((a, b) => a - b);
	}, [templates]);

	const hasSchedule = activeDays.length > 0;

	return (
		<View className="py-stack-md">
			<Text variant="h4" className="text-content">
				About
			</Text>
			<Text variant="bodySm" className="mt-stack-sm text-content-secondary">
				{profile.description}
			</Text>

			<View className="mt-stack-lg gap-stack-xs">
				<InfoRow icon={Phone} label="Phone" value={profile.phoneNumber} />

				{isLoading ? (
					<View className="gap-stack-sm py-stack-sm">
						<Skeleton className="h-12 w-full rounded-input" />
						<Skeleton className="h-12 w-full rounded-input" />
					</View>
				) : hasSchedule ? (
					<>
						<InfoRow
							icon={CalendarDays}
							label="Available days"
							value={activeDays.map((d) => DAY_NAMES[d]).join(" · ")}
						/>
						<InfoRow
							icon={Clock}
							label="Available times"
							value={
								activeHours.length > 0
									? activeHours.map(hourLabel).join(" · ")
									: "All listed hours"
							}
						/>
					</>
				) : (
					<View className="mt-stack-xs rounded-input bg-surface-elevated px-card py-stack-md">
						<Text variant="bodySm" className="text-content-muted">
							This technician hasn't set their working days and times yet.
						</Text>
					</View>
				)}
			</View>
		</View>
	);
}
