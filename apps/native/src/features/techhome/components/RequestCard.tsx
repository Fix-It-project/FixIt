import { Check, Clock, MapPin, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { PaymentMethodBadge } from "@/src/features/booking-orders/components/PaymentMethodBadge";
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
	onPress: () => void;
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
	onPress,
	actionPending,
}: RequestCardProps) {
	const { t, i18n } = useTranslation("technician");
	const now = useNowTick();
	const expiry =
		pendingExpiryHours === undefined
			? undefined
			: pendingExpiryFor(order.created_at, pendingExpiryHours, now);

	return (
		<PressableScale
			pressedScale={0.98}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={t("home.requests.openDetailsAria")}
		>
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
									? t("home.requests.expired")
									: t("home.requests.autoDeclinesIn", { time: expiry.label })}
							</Text>
						) : null}
						{order.created_at ? (
							<Text variant="caption" className="ml-auto text-content-muted">
								{formatRelativeTime(order.created_at, undefined, i18n.language)}
							</Text>
						) : null}
					</View>

					{/* request body */}
					<View className="pt-stack-sm">
						<View className="flex-row items-start justify-between gap-stack-sm">
							<Text
								variant="body"
								className="flex-1 font-bold text-content"
								numberOfLines={1}
							>
								{order.service_name ?? t("home.common.newRequest")}
							</Text>
							<PaymentMethodBadge method={order.payment_method} />
						</View>
						<Text
							variant="caption"
							className="mt-0.5 text-content-muted"
							numberOfLines={2}
						>
							{order.problem_description ?? t("home.common.noDescription")}
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
								<Icon
									as={MapPin}
									size={13}
									className="text-content-secondary"
								/>
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
							onPress={(event) => {
								event.stopPropagation();
								onDecline();
							}}
							disabled={actionPending}
							accessibilityLabel={t("home.requests.declineRequestAria")}
						>
							<Icon as={X} size={16} className="text-foreground" />
							<Text variant="buttonMd" className="text-foreground">
								{t("home.requests.decline")}
							</Text>
						</Button>
						<Button
							variant="primary"
							size="md"
							className="flex-1"
							onPress={(event) => {
								event.stopPropagation();
								onAccept();
							}}
							disabled={actionPending}
							accessibilityLabel={t("home.requests.acceptRequestAria")}
						>
							<Icon as={Check} size={16} className="text-surface-on-primary" />
							<Text variant="buttonMd" className="text-surface-on-primary">
								{t("home.requests.acceptJob")}
							</Text>
						</Button>
					</View>
				</View>
			</Card>
		</PressableScale>
	);
}
