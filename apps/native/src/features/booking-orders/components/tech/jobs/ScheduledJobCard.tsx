import { router } from "expo-router";
import { CalendarClock, ChevronRight, Clock } from "lucide-react-native";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	formatTime,
	getAvatarColor,
} from "@/src/features/booking-orders/utils/booking-helpers";
import { useDebounce } from "@/src/hooks/useDebounce";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { ROUTES } from "@/src/lib/navigation";
import {
	ACTIVE_STATUSES,
	RESCHEDULE_PENDING_STATUSES,
} from "../../../schemas/order-status.schema";
import type { TechnicianBooking } from "../../../schemas/response.schema";
import { JobMetaRow } from "./JobMetaRow";

interface ScheduledJobCardProps {
	readonly booking: TechnicianBooking;
}

/** Statuses where the tech is actively working the job right now. */
function isLive(status: string): boolean {
	return status !== "accepted" && ACTIVE_STATUSES.has(status as never);
}

/** One committed job in the Jobs → Scheduled tab. Whole card opens detail. */
export function ScheduledJobCard({ booking }: ScheduledJobCardProps) {
	const themeColors = useThemeColors();
	const open = useDebounce(() =>
		router.push(ROUTES.technician.bookingDetail(booking.id)),
	);
	const initials = getPfpInitialsFallback(booking.user_name);
	const avatarColor = getAvatarColor(booking.user_name);
	const scheduledTime = formatTime(booking.scheduled_start_at);
	const live = isLive(booking.status);
	const reschedulePending =
		booking.has_pending_reschedule === true ||
		RESCHEDULE_PENDING_STATUSES.has(booking.status as never);

	return (
		<PressableScale
			pressedScale={0.985}
			onPress={open}
			className="rounded-card bg-card p-card"
			accessibilityLabel={`Open booking with ${booking.user_name ?? "customer"}`}
		>
			<View className="flex-row items-center gap-stack-md">
				<View
					className="h-control-icon-box-lg w-control-icon-box-lg items-center justify-center rounded-pill"
					style={{ backgroundColor: avatarColor }}
				>
					<Text
						variant="buttonLg"
						className="font-bold"
						style={{ color: themeColors.surfaceOnPrimary }}
					>
						{initials}
					</Text>
				</View>

				<View className="flex-1">
					<View className="flex-row items-center gap-stack-xs">
						<Text
							variant="label"
							className="flex-1 font-bold text-content"
							numberOfLines={1}
						>
							{booking.user_name ?? "Customer"}
						</Text>
						{live ? (
							<View className="rounded-pill bg-status-online/15 px-stack-sm py-0.5">
								<Text
									variant="caption"
									className="font-semibold text-status-online"
								>
									Live
								</Text>
							</View>
						) : null}
					</View>

					<Text
						variant="caption"
						className="mt-0.5 text-content-secondary"
						numberOfLines={1}
					>
						{booking.service_name ?? "Service"}
					</Text>

					<View className="mt-stack-xs flex-row items-center gap-1">
						<Icon as={Clock} size={13} className="text-content-muted" />
						<Text variant="caption" className="text-content-muted">
							{scheduledTime ?? "Time TBD"}
						</Text>
					</View>

					<JobMetaRow
						inspectionFee={booking.inspection_fee}
						inspectionDistanceKm={booking.inspection_distance_km}
						className="pt-stack-xs"
					/>

					{reschedulePending ? (
						<View className="mt-stack-xs flex-row items-center gap-1 self-start rounded-pill bg-app-primary/10 px-stack-sm py-0.5">
							<Icon as={CalendarClock} size={12} className="text-app-primary" />
							<Text
								variant="caption"
								className="font-semibold text-app-primary"
							>
								Reschedule pending
							</Text>
						</View>
					) : null}
				</View>

				<Icon as={ChevronRight} size={18} className="text-content-muted" />
			</View>
		</PressableScale>
	);
}
