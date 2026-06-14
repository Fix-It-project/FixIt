import { useRouter } from "expo-router";
import { ArrowRight, MapPin } from "lucide-react-native";
import { View } from "react-native";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import type { OrderStatus, TechHomeOrder } from "../schemas/orders.schema";
import { formatEgp } from "../utils/money";
import { SectionHeader } from "./SectionHeader";

const STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
	tracking: "ON THE WAY",
	arrived_inspection: "INSPECTING",
	awaiting_final_cost: "PRICING",
	negotiating: "NEGOTIATING",
	in_progress: "IN PROGRESS",
	awaiting_payment: "AWAITING PAYMENT",
};

export function ActiveJobCard({ order }: { order: TechHomeOrder }) {
	const router = useRouter();
	const customerName = order.user_name ?? "Customer";
	const initials = getPfpInitialsFallback(customerName);

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title="Active job" />
			<Card elevated className="p-card">
				{/* status strip — STATUS_LABEL is a compact functional status code */}
				<View className="flex-row items-center gap-stack-xs border-edge border-b pb-stack-sm">
					<View className="h-2 w-2 rounded-full bg-app-primary" />
					<Text variant="caption" className="font-semibold text-app-primary">
						{STATUS_LABEL[order.status] ?? "IN PROGRESS"}
					</Text>
				</View>

				{/* customer + payout */}
				<View className="flex-row items-center gap-stack-md py-stack-sm">
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
					{order.final_price == undefined ? null : (
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

				<Button
					variant="primary"
					size="md"
					fullWidth
					onPress={() => router.push(ROUTES.technician.bookingDetail(order.id))}
				>
					<Text variant="buttonMd" className="text-surface-on-primary">
						Open job
					</Text>
					<Icon as={ArrowRight} size={16} className="text-surface-on-primary" />
				</Button>
			</Card>
		</View>
	);
}
