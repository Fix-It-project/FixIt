import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Progress } from "@/src/components/ui/progress";
import { Text } from "@/src/components/ui/text";
import { ROUTES } from "@/src/lib/navigation";
import type { OrderStatus, TechHomeOrder } from "../schemas/orders.schema";
import { JobCustomerRow } from "./JobCustomerRow";
import { JobInspectionMeta } from "./JobInspectionMeta";
import { SectionHeader } from "./SectionHeader";

const STATUS_LABEL_KEY: Partial<Record<OrderStatus, string>> = {
	tracking: "home.activeJob.status.tracking",
	arrived_inspection: "home.activeJob.status.arrivedInspection",
	awaiting_final_cost: "home.activeJob.status.awaitingFinalCost",
	negotiating: "home.activeJob.status.negotiating",
	in_progress: "home.activeJob.status.inProgress",
	awaiting_payment: "home.activeJob.status.awaitingPayment",
};

// ── Job progress (mirrors the user home ActiveOrderStrip 5-step model) ──────────
// on the way → inspecting → pricing → in progress → awaiting payment.
const JOB_STEPS = [
	"home.activeJob.steps.onTheWay",
	"home.activeJob.steps.inspecting",
	"home.activeJob.steps.pricing",
	"home.activeJob.steps.inProgress",
	"home.activeJob.steps.awaitingPayment",
] as const;
const TOTAL_JOB_STEPS = JOB_STEPS.length;

function getJobStep(status: OrderStatus): number {
	switch (status) {
		case "tracking":
			return 1;
		case "arrived_inspection":
			return 2;
		case "awaiting_final_cost":
		case "negotiating":
			return 3;
		case "in_progress":
			return 4;
		case "awaiting_payment":
			return 5;
		default:
			return 1;
	}
}

export function ActiveJobCard({ order }: { order: TechHomeOrder }) {
	const { t } = useTranslation("technician");
	const router = useRouter();
	const jobStep = getJobStep(order.status);
	const statusLabelKey =
		STATUS_LABEL_KEY[order.status] ?? "home.activeJob.status.inProgress";

	const openDetails = () =>
		router.push(ROUTES.technician.bookingDetail(order.id));

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title={t("home.sections.activeJob")} />
			<PressableScale
				onPress={openDetails}
				accessibilityRole="button"
				accessibilityLabel={t("home.common.openJobDetails")}
			>
				<Card elevated className="p-card">
					{/* status strip — STATUS_LABEL is a compact functional status code */}
					<View className="flex-row items-center gap-stack-xs border-edge border-b pb-stack-sm">
						<View className="h-2 w-2 rounded-full bg-app-primary" />
						<Text variant="caption" className="font-semibold text-app-primary">
							{t(statusLabelKey)}
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

					{/* progress — 5-step job lifecycle, matches user home tracking strip */}
					<View className="pb-stack-sm">
						<Progress
							value={(jobStep / TOTAL_JOB_STEPS) * 100}
							className="h-1.5 bg-surface-elevated"
							indicatorClassName="bg-app-primary"
						/>
						<View className="mt-stack-xs flex-row items-center justify-between">
							<Text
								variant="caption"
								className="font-semibold text-app-primary"
								numberOfLines={1}
							>
								{t(JOB_STEPS[jobStep - 1])}
							</Text>
							<Text variant="caption" className="text-content-muted">
								{`${jobStep}/${TOTAL_JOB_STEPS}`}
							</Text>
						</View>
					</View>

					<Button variant="primary" size="md" fullWidth onPress={openDetails}>
						<Text variant="buttonMd" className="text-surface-on-primary">
							{t("home.activeJob.openJob")}
						</Text>
						<Icon
							as={ArrowRight}
							size={16}
							className="text-surface-on-primary"
						/>
					</Button>
				</Card>
			</PressableScale>
		</View>
	);
}
