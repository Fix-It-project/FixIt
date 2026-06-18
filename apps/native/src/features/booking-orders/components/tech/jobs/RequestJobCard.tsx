import { Check, Clock, MapPin, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import {
	formatDate,
	formatTime,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { formatRelativeTime } from "@/src/lib/date/relative-time";
import type { TechnicianBooking } from "../../../schemas/response.schema";
import { PaymentMethodBadge } from "../../PaymentMethodBadge";
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
	const { t, i18n } = useTranslation("technician");
	const scheduledDate = formatDate(booking.scheduled_date, i18n.language);
	const scheduledTime = formatTime(booking.scheduled_start_at, i18n.language);

	return (
		<Card elevated className="overflow-hidden p-card">
			{/* meta row */}
			<View className="flex-row items-center gap-stack-xs">
				<View className="rounded-pill bg-app-primary/10 px-stack-sm py-0.5">
					<Text variant="caption" className="font-semibold text-app-primary">
						{t("jobs.common.newRequest")}
					</Text>
				</View>
				<PaymentMethodBadge method={booking.payment_method} />
				{booking.created_at ? (
					<Text variant="caption" className="ml-auto text-content-muted">
						{formatRelativeTime(booking.created_at, new Date(), i18n.language)}
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
					{booking.service_name ?? t("jobs.common.newRequest")}
				</Text>
				<Text
					variant="caption"
					className="mt-0.5 text-content-muted"
					numberOfLines={2}
				>
					{booking.problem_description ?? t("jobs.common.noDescription")}
				</Text>
			</View>

			{/* schedule + location */}
			<View className="flex-row items-center gap-stack-md pt-stack-sm">
				<View className="flex-row items-center gap-1">
					<Icon as={Clock} size={13} className="text-content-secondary" />
					<Text variant="caption" className="text-content-secondary">
						{scheduledDate}
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
					accessibilityLabel={t("jobs.requests.declineAria")}
				>
					<Icon as={X} size={16} className="text-foreground" />
					<Text variant="buttonMd" className="text-foreground">
						{t("jobs.requests.decline")}
					</Text>
				</Button>
				<Button
					variant="primary"
					size="md"
					className="flex-1"
					onPress={onAccept}
					disabled={actionPending}
					accessibilityLabel={t("jobs.requests.acceptAria")}
				>
					<Icon as={Check} size={16} className="text-surface-on-primary" />
					<Text variant="buttonMd" className="text-surface-on-primary">
						{t("jobs.requests.acceptJob")}
					</Text>
				</Button>
			</View>
		</Card>
	);
}
