import { useRouter } from "expo-router";
import { ArrowRight, MapPin } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import CustomerActionsSheet, {
	type CustomerActionsSheetHandle,
} from "@/src/components/identity/CustomerActionsSheet";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Progress } from "@/src/components/ui/progress";
import { Text } from "@/src/components/ui/text";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import type { OrderStatus, TechHomeOrder } from "../schemas/orders.schema";
import { formatEgp } from "../utils/money";
import { JobInspectionMeta } from "./JobInspectionMeta";
import { SectionHeader } from "./SectionHeader";

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
	tracking: "ON THE WAY",
	arrived_inspection: "INSPECTING",
	awaiting_final_cost: "PRICING",
	negotiating: "NEGOTIATING",
	in_progress: "IN PROGRESS",
	awaiting_payment: "AWAITING PAYMENT",
};

// ── Job progress (mirrors the user home ActiveOrderStrip 5-step model) ──────────
// on the way → inspecting → pricing → in progress → awaiting payment.
const JOB_STEPS = [
	"On the way",
	"Inspecting",
	"Pricing",
	"In progress",
	"Awaiting payment",
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
	const router = useRouter();
	const sheetRef = useRef<CustomerActionsSheetHandle>(null);
	const customerName = order.user_name ?? "Customer";
	const initials = getPfpInitialsFallback(customerName);
	const jobStep = getJobStep(order.status);

	const openDetails = () =>
		router.push(ROUTES.technician.bookingDetail(order.id));
	const openCustomerSheet = () =>
		sheetRef.current?.open({
			name: customerName,
			phone: order.user_phone ?? null,
			address: order.user_address ?? null,
			latitude: order.user_latitude ?? null,
			longitude: order.user_longitude ?? null,
			problem: order.problem_description ?? null,
		});

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title="Active job" />
			<PressableScale
				onPress={openDetails}
				accessibilityRole="button"
				accessibilityLabel="Open job details"
			>
				<Card elevated className="p-card">
					{/* status strip — STATUS_LABEL is a compact functional status code */}
					<View className="flex-row items-center gap-stack-xs border-edge border-b pb-stack-sm">
						<View className="h-2 w-2 rounded-full bg-app-primary" />
						<Text variant="caption" className="font-semibold text-app-primary">
							{STATUS_LABEL[order.status] ?? "IN PROGRESS"}
						</Text>
					</View>

					{/* customer (tap → contact sheet) + payout */}
					<View className="flex-row items-center gap-stack-md py-stack-sm">
						<Pressable
							onPress={openCustomerSheet}
							accessibilityRole="button"
							accessibilityLabel={`Contact ${customerName}`}
							className="flex-1 flex-row items-center gap-stack-md"
						>
							<Avatar alt={customerName} className="h-12 w-12">
								<AvatarFallback className="bg-app-primary-light">
									<Text variant="body" className="font-bold text-app-primary">
										{initials}
									</Text>
								</AvatarFallback>
							</Avatar>
							<View className="flex-1">
								<Text
									variant="body"
									className="font-bold text-content"
									numberOfLines={1}
								>
									{customerName}
								</Text>
								<Text
									variant="caption"
									className="text-content-muted"
									numberOfLines={1}
								>
									{order.service_name ?? order.problem_description ?? "Service"}
								</Text>
								{order.user_address ? (
									<View className="mt-1 flex-row items-center gap-1">
										<Icon
											as={MapPin}
											size={13}
											className="text-content-secondary"
										/>
										<Text
											variant="caption"
											className="text-content-secondary"
											numberOfLines={1}
										>
											{order.user_address}
										</Text>
									</View>
								) : null}
							</View>
						</Pressable>
						{order.final_price == null ? null : (
							<View className="items-end">
								<Text variant="caption" className="text-content-muted">
									Payout
								</Text>
								<Text variant="body" className="font-bold text-content">
									{formatEgp(order.final_price)}
								</Text>
							</View>
						)}
					</View>

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
								{JOB_STEPS[jobStep - 1]}
							</Text>
							<Text variant="caption" className="text-content-muted">
								{`${jobStep}/${TOTAL_JOB_STEPS}`}
							</Text>
						</View>
					</View>

					<Button variant="primary" size="md" fullWidth onPress={openDetails}>
						<Text variant="buttonMd" className="text-surface-on-primary">
							Open job
						</Text>
						<Icon
							as={ArrowRight}
							size={16}
							className="text-surface-on-primary"
						/>
					</Button>
				</Card>
			</PressableScale>
			<CustomerActionsSheet ref={sheetRef} />
		</View>
	);
}
