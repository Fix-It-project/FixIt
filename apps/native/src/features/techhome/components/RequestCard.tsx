import { Check, Clock, MapPin, Wrench, X } from "lucide-react-native";
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
						<Text
							variant="caption"
							className="font-bold text-warning uppercase tracking-wide"
						>
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
				<View className="flex-row items-center gap-stack-md pt-stack-sm">
					<View className="h-12 w-12 items-center justify-center rounded-2xl bg-warning-light">
						<Icon as={Wrench} size={18} className="text-warning" />
					</View>
					<View className="flex-1">
						<Text
							variant="body"
							className="font-bold text-content"
							numberOfLines={1}
						>
							{order.service_name ?? "New request"}
						</Text>
						<Text
							variant="bodySm"
							className="text-content-muted"
							numberOfLines={2}
						>
							{order.problem_description ?? "No description provided"}
						</Text>
					</View>
				</View>

				{/* schedule + location */}
				<View className="flex-row items-center gap-stack-md pt-stack-sm">
					<View className="flex-row items-center gap-1">
						<Icon as={Clock} size={13} className="text-content-secondary" />
						<Text variant="caption" className="text-content-secondary">
							{order.scheduled_date}
							{order.scheduled_start_at
								? ` · ${order.scheduled_start_at.slice(11, 16)}`
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

				{/* actions */}
				<View className="flex-row gap-stack-sm pt-stack-md">
					<Button
						variant="outline"
						size="md"
						className="flex-1 border-danger-soft"
						onPress={onDecline}
						disabled={actionPending}
						accessibilityLabel="Decline request"
					>
						<Icon as={X} size={16} className="text-danger" />
						<Text variant="buttonMd" className="text-danger">
							Decline
						</Text>
					</Button>
					<Button
						variant="success"
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
