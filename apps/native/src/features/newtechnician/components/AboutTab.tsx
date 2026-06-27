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
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { useInspectionFeePreview } from "@/src/features/booking-orders/hooks";
import { formatCurrency } from "@/src/features/booking-orders/utils/format-currency";
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
		<View className="flex-row items-start gap-stack-md py-stack-md">
			<View className="pt-stack-xs">
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
	const { data: addresses, isLoading: isLoadingAddresses } = useAddressesQuery();
	const { templates, isLoading } = useTechnicianPublicSchedule(technicianId);
	const activePricingAddress = useMemo(() => {
		return (
			addresses?.find(
				(address) =>
					address.is_active &&
					address.latitude != undefined &&
					address.longitude != undefined,
			) ??
			addresses?.find(
				(address) =>
					address.latitude != undefined && address.longitude != undefined,
			) ??
			null
		);
	}, [addresses]);
	const inspectionFeeQuery = useInspectionFeePreview(
		technicianId,
		activePricingAddress?.id,
	);

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
	let inspectionFeeLabel: string;
	if (inspectionFeeQuery.data) {
		inspectionFeeLabel = formatCurrency(inspectionFeeQuery.data.inspection_fee);
	} else if (isLoadingAddresses || inspectionFeeQuery.isLoading) {
		inspectionFeeLabel = t("about.loadingInspectionFee");
	} else if (!activePricingAddress?.id) {
		inspectionFeeLabel = t("about.addAddressForFee");
	} else {
		inspectionFeeLabel = t("about.inspectionFeeUnavailable");
	}

	return (
		<View className="pt-stack-sm">
			<InfoRow
				icon={Banknote}
				label={t("about.inspectionFee")}
				value={inspectionFeeLabel}
			/>
			<View className="h-px bg-edge/20" />

			{isLoading ? (
				<View className="gap-stack-sm py-stack-md">
					<Skeleton className="h-12 w-full rounded-input" />
					<Skeleton className="h-12 w-full rounded-input" />
				</View>
			) : null}
			{!isLoading && hasSchedule ? (
				<>
					<InfoRow
						icon={CalendarDays}
						label={t("about.availableDays")}
						value={activeDays
							.map((d) => t(`about.days.${DAY_KEYS[d]}` as Parameters<typeof t>[0]))
							.join(" · ")}
					/>
					<View className="h-px bg-edge/20" />
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
			) : null}
			{!isLoading && !hasSchedule ? (
				<View className="mt-stack-sm rounded-input bg-surface-elevated px-card py-stack-md">
					<Text variant="bodySm" className="text-content-muted">
						{t("about.noSchedule")}
					</Text>
				</View>
			) : null}
		</View>
	);
}
