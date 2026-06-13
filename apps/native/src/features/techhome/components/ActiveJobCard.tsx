import { useRouter } from "expo-router";
import { ArrowRight, MapPin } from "lucide-react-native";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
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

/** Small pulsing dot signalling live work. */
function LiveDot() {
	const reducedMotion = useReducedMotion();
	const pulse = useSharedValue(0);

	useEffect(() => {
		if (reducedMotion) return;
		pulse.value = withRepeat(
			withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
			-1,
		);
	}, [pulse, reducedMotion]);

	const ringStyle = useAnimatedStyle(() => ({
		opacity: 0.35 * (1 - pulse.value),
		transform: [{ scale: 1 + pulse.value * 1.4 }],
	}));

	return (
		<View className="h-2.5 w-2.5 items-center justify-center">
			<View className="h-2.5 w-2.5 rounded-full bg-app-primary" />
			{reducedMotion ? null : (
				<Animated.View
					pointerEvents="none"
					className="absolute h-2.5 w-2.5 rounded-full bg-app-primary"
					style={ringStyle}
				/>
			)}
		</View>
	);
}

export function ActiveJobCard({ order }: { order: TechHomeOrder }) {
	const router = useRouter();
	const customerName = order.user_name ?? "Customer";
	const initials = getPfpInitialsFallback(customerName);

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader title="Active job" hint="Happening now" />
			<Card elevated className="p-card">
				{/* status strip */}
				<View className="flex-row items-center gap-stack-xs border-edge border-b border-dashed pb-stack-sm">
					<LiveDot />
					<Text
						variant="caption"
						className="font-bold text-app-primary tracking-wide"
					>
						{STATUS_LABEL[order.status] ?? "IN PROGRESS"}
					</Text>
					<Text variant="caption" className="ml-auto text-content-muted">
						#{order.id.slice(0, 8).toUpperCase()}
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
							variant="bodySm"
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
							<Text variant="caption" className="text-content-muted uppercase">
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
