import { Check, Clock, MapPin, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { formatRelativeTime } from "@/src/lib/date/relative-time";
import { EXPIRY_TICK_MS } from "../constants";
import type { TechHomeOrder } from "../schemas/orders.schema";
import { pendingExpiryFor } from "../utils/expiry";
import { formatSlotTime } from "../utils/format-time";
import { JobInspectionMeta } from "./JobInspectionMeta";

interface RequestCardProps {
	order: TechHomeOrder;
	pendingExpiryHours: number | undefined;
	onAccept: () => void;
	onDecline: () => void;
	actionPending: boolean;
}

/** Re-renders each minute so the expiry countdown stays honest. */
function useNowTick(): Date {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), EXPIRY_TICK_MS);
		return () => clearInterval(id);
	}, []);
	return now;
}

export function RequestCard({
	order,
	pendingExpiryHours,
	onAccept,
	onDecline,
	actionPending,
}: RequestCardProps) {
	const now = useNowTick();
	const expiry =
		pendingExpiryHours === undefined
			? undefined
			: pendingExpiryFor(order.created_at, pendingExpiryHours, now);

	return (
		<Card elevated className="overflow-hidden">
			{/* expiry countdown bar — width tracks remaining time */}
			{expiry ? (
				<View className="h-1 w-full bg-warning-light">
					<View
						className="h-full rounded-r-full bg-warning"
						style={{ width: `${Math.round(expiry.fraction * 100)}%` }}
					/>
				</View>
			) : null}

			<View className="p-card">
				{/* meta row */}
				<View className="flex-row items-center gap-stack-xs">
					{expiry ? (
						<Text variant="caption" className="font-semibold text-warning">
							{expiry.remainingMs === 0
								? "Expired"
								: `Auto-declines in ${expiry.label}`}
						</Text>
					) : null}
					{order.created_at ? (
						<Text variant="caption" className="ml-auto text-content-muted">
							{formatRelativeTime(order.created_at)}
						</Text>
					) : null}
				</View>

				{/* request body */}
				<View className="pt-stack-sm">
					<Text
						variant="body"
						className="font-bold text-content"
						numberOfLines={1}
					>
						{order.service_name ?? "New request"}
					</Text>
					<Text
						variant="caption"
						className="mt-0.5 text-content-muted"
						numberOfLines={2}
					>
						{order.problem_description ?? "No description provided"}
					</Text>
				</View>

				{/* schedule + location */}
				<View className="flex-row items-center gap-stack-md pt-stack-sm">
					<View className="flex-row items-center gap-1">
						<Icon as={Clock} size={13} className="text-content-secondary" />
						<Text variant="caption" className="text-content-secondary">
							{order.scheduled_date}
							{order.scheduled_start_at
								? ` · ${formatSlotTime(order.scheduled_start_at)}`
								: ""}
						</Text>
					</View>
					{order.user_address ? (
						<View className="flex-1 flex-row items-center gap-1">
							<Icon as={MapPin} size={13} className="text-content-secondary" />
							<Text
								variant="caption"
								className="flex-1 text-content-secondary"
								numberOfLines={1}
							>
								{order.user_address}
							</Text>
						</View>
					) : null}
				</View>

				{/* inspection fee + distance it was priced from */}
				<JobInspectionMeta
					inspectionFee={order.inspection_fee}
					inspectionDistanceKm={order.inspection_distance_km}
					className="pt-stack-sm"
				/>

				{/* actions */}
				<View className="flex-row gap-stack-sm pt-stack-md">
					<Button
						variant="secondary"
						size="md"
						className="flex-1"
						onPress={onDecline}
						disabled={actionPending}
						accessibilityLabel="Decline request"
					>
						<Icon as={X} size={16} className="text-foreground" />
						<Text variant="buttonMd" className="text-foreground">
							Decline
						</Text>
					</Button>
					<Button
						variant="primary"
						size="md"
						className="flex-1"
						onPress={onAccept}
						disabled={actionPending}
						accessibilityLabel="Accept request"
					>
						<Icon as={Check} size={16} className="text-surface-on-primary" />
						<Text variant="buttonMd" className="text-surface-on-primary">
							Accept job
						</Text>
					</Button>
				</View>
			</View>
		</Card>
	);
}
