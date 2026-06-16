import { Check, Clock, MapPin, X } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { formatTime } from "@/src/features/booking-orders/utils/booking-helpers";
import { formatRelativeTime } from "@/src/lib/date/relative-time";
import type { TechnicianBooking } from "../../../schemas/response.schema";
import { JobMetaRow } from "./JobMetaRow";

interface RequestJobCardProps {
	readonly booking: TechnicianBooking;
	readonly onAccept: () => void;
	readonly onDecline: () => void;
	readonly actionPending: boolean;
}

/** A single pending offer in the Jobs → Requests tab. */
export function RequestJobCard({
	booking,
	onAccept,
	onDecline,
	actionPending,
}: RequestJobCardProps) {
	const scheduledTime = formatTime(booking.scheduled_start_at);

	return (
		<Card elevated className="overflow-hidden p-card">
			{/* meta row */}
			<View className="flex-row items-center gap-stack-xs">
				<View className="rounded-pill bg-app-primary/10 px-stack-sm py-0.5">
					<Text variant="caption" className="font-semibold text-app-primary">
						New request
					</Text>
				</View>
				{booking.created_at ? (
					<Text variant="caption" className="ml-auto text-content-muted">
						{formatRelativeTime(booking.created_at)}
					</Text>
				) : null}
			</View>

			{/* body */}
			<View className="pt-stack-sm">
				<Text
					variant="body"
					className="font-bold text-content"
					numberOfLines={1}
				>
					{booking.service_name ?? "New request"}
				</Text>
				<Text
					variant="caption"
					className="mt-0.5 text-content-muted"
					numberOfLines={2}
				>
					{booking.problem_description ?? "No description provided"}
				</Text>
			</View>

			{/* schedule + location */}
			<View className="flex-row items-center gap-stack-md pt-stack-sm">
				<View className="flex-row items-center gap-1">
					<Icon as={Clock} size={13} className="text-content-secondary" />
					<Text variant="caption" className="text-content-secondary">
						{booking.scheduled_date}
						{scheduledTime ? ` · ${scheduledTime}` : ""}
					</Text>
				</View>
				{booking.user_address ? (
					<View className="flex-1 flex-row items-center gap-1">
						<Icon as={MapPin} size={13} className="text-content-secondary" />
						<Text
							variant="caption"
							className="flex-1 text-content-secondary"
							numberOfLines={1}
						>
							{booking.user_address}
						</Text>
					</View>
				) : null}
			</View>

			<JobMetaRow
				inspectionFee={booking.inspection_fee}
				inspectionDistanceKm={booking.inspection_distance_km}
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
		</Card>
	);
}
