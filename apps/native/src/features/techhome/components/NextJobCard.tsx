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
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import { useStartTrackingMutation } from "../hooks/useStartTrackingMutation";
import type { TechHomeOrder } from "../schemas/orders.schema";
import { formatSlotTime } from "../utils/format-time";
import { formatEgp } from "../utils/money";
import { SectionHeader } from "./SectionHeader";

/**
 * Primary slot when there's no active job but a job is scheduled to START today.
 * "Start tracking" runs the mutation inline — the cache flips the order to
 * `tracking`, so the slot re-derives into the ActiveJobCard.
 */
export function NextJobCard({ order }: { order: TechHomeOrder }) {
	const colors = useThemeColors();
	const router = useRouter();
	const startTracking = useStartTrackingMutation();

	const sheetRef = useRef<CustomerActionsSheetHandle>(null);
	const customerName = order.user_name ?? "Customer";
	const initials = getPfpInitialsFallback(customerName);
	const time = formatSlotTime(order.scheduled_start_at);

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
			<SectionHeader title="Next job" />
			<PressableScale
				onPress={openDetails}
				accessibilityRole="button"
				accessibilityLabel="Open job details"
			>
				<Card elevated className="p-card">
					{/* status row */}
					<View className="flex-row items-center gap-stack-xs border-edge border-b pb-stack-sm">
						<View className="h-2 w-2 rounded-full bg-app-primary" />
						<Text variant="caption" className="text-content-secondary">
							Starts {time}
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

					{/* actions */}
					<View className="flex-row gap-stack-sm">
						<Button
							variant="outline"
							size="md"
							className="flex-1"
							onPress={openDetails}
							accessibilityLabel="View job details"
						>
							<Text variant="buttonMd" className="text-content">
								View details
							</Text>
						</Button>
						<Button
							variant="primary"
							size="md"
							className="flex-1"
							onPress={() => startTracking.mutate(order.id)}
							disabled={startTracking.isPending}
							accessibilityLabel="Start tracking this job"
						>
							<Text variant="buttonMd" className="text-surface-on-primary">
								Start tracking
							</Text>
							<Icon as={ArrowRight} size={16} color={colors.surfaceOnPrimary} />
						</Button>
					</View>
				</Card>
			</PressableScale>
			<CustomerActionsSheet ref={sheetRef} />
		</View>
	);
}
