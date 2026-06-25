import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ROUTES } from "@/src/lib/navigation";
import { useStartTrackingMutation } from "../hooks/useStartTrackingMutation";
import type { TechHomeOrder } from "../schemas/orders.schema";
import { formatSlotTime } from "../utils/format-time";
import { JobCustomerRow } from "./JobCustomerRow";
import { JobInspectionMeta } from "./JobInspectionMeta";
import { SectionHeader } from "./SectionHeader";

/**
 * Primary slot when there's no active job but a job is scheduled to START today.
 * "Start tracking" runs the mutation inline — the cache flips the order to
 * `tracking`, so the slot re-derives into the ActiveJobCard.
 */
export function NextJobCard({ order }: { order: TechHomeOrder }) {
	const { t } = useTranslation("technician");
	const colors = useThemeColors();
	const router = useRouter();
	const startTracking = useStartTrackingMutation();

	const time = formatSlotTime(order.scheduled_start_at);

	const openDetails = () =>
		router.push(ROUTES.technician.bookingDetail(order.id));

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title={t("home.sections.nextJob")} />
			<PressableScale
				onPress={openDetails}
				accessibilityRole="button"
				accessibilityLabel={t("home.common.openJobDetails")}
			>
				<Card elevated className="p-card">
					{/* status row */}
					<View className="flex-row items-center gap-stack-xs border-edge border-b pb-stack-sm">
						<View className="h-2 w-2 rounded-full bg-app-primary" />
						<Text variant="caption" className="text-content-secondary">
							{t("home.nextJob.starts", { time })}
						</Text>
					</View>

					{/* customer (tap → contact sheet) + payout */}
					<JobCustomerRow order={order} />

					{/* inspection fee + distance it was priced from */}
					<JobInspectionMeta
						inspectionFee={order.inspection_fee}
						inspectionDistanceKm={order.inspection_distance_km}
						className="pb-stack-sm"
					/>

					{/* actions */}
					<View className="flex-row gap-stack-sm">
						<Button
							variant="outline"
							size="md"
							className="flex-1"
							onPress={openDetails}
							accessibilityLabel={t("home.nextJob.viewDetailsAria")}
						>
							<Text variant="buttonMd" className="text-content">
								{t("home.nextJob.viewDetails")}
							</Text>
						</Button>
						<Button
							variant="primary"
							size="md"
							className="flex-1"
							onPress={() => startTracking.mutate(order.id)}
							disabled={startTracking.isPending}
							accessibilityLabel={t("home.nextJob.startTrackingAria")}
						>
							<Text variant="buttonMd" className="text-surface-on-primary">
								{t("home.nextJob.startTracking")}
							</Text>
							<Icon as={ArrowRight} size={16} color={colors.surfaceOnPrimary} />
						</Button>
					</View>
				</Card>
			</PressableScale>
		</View>
	);
}
