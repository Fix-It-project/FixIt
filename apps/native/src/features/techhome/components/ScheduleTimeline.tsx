import { useRouter } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { ROUTES } from "@/src/lib/navigation";
import { useTodaySchedule } from "../hooks/useTechHomeOrdersQuery";
import {
	ACTIVE_JOB_STATUSES,
	type TechHomeOrder,
} from "../schemas/orders.schema";
import { formatSlotTime } from "../utils/format-time";
import { formatEgp } from "../utils/money";
import { SectionHeader } from "./SectionHeader";

type SlotState = "done" | "progress" | "upcoming";

const DOT_CLASS: Record<SlotState, string> = {
	done: "bg-content-muted",
	progress: "bg-app-primary",
	upcoming: "bg-warning",
};

function slotState(order: TechHomeOrder): SlotState {
	if (order.status === "completed") return "done";
	if (ACTIVE_JOB_STATUSES.has(order.status)) return "progress";
	return "upcoming";
}

/** A soft filled row — flat (no card surface), grouped by gentle fill. */
function ScheduleRow({ order }: { order: TechHomeOrder }) {
	const state = slotState(order);
	const dotClass = DOT_CLASS[state];

	return (
		<View className="flex-row items-center gap-stack-md rounded-card bg-surface-muted px-card py-stack-sm">
			<View className={`h-2 w-2 rounded-full ${dotClass}`} />
			<Text
				variant="caption"
				className={`w-12 ${
					state === "progress" ? "text-app-primary" : "text-content-secondary"
				}`}
			>
				{formatSlotTime(order.scheduled_start_at)}
			</Text>
			<Text
				variant="body"
				className={`flex-1 ${
					state === "done" ? "text-content-muted line-through" : "text-content"
				}`}
				numberOfLines={1}
			>
				{order.service_name ?? order.problem_description ?? "Job"}
				{order.user_name ? ` · ${order.user_name}` : ""}
			</Text>
			{order.final_price == undefined ? null : (
				<Text variant="caption" className="font-semibold text-content">
					{formatEgp(order.final_price)}
				</Text>
			)}
		</View>
	);
}

export function ScheduleTimeline() {
	const router = useRouter();
	const schedule = useTodaySchedule();

	// Collapse when empty — the quiet-state hero line covers a free day.
	if (schedule.length === 0) return null;

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader
				title="Today's schedule"
				hint={`${schedule.length} ${schedule.length === 1 ? "job" : "jobs"} today`}
				action={
					<Button
						variant="ghost"
						size="sm"
						onPress={() => router.push(ROUTES.technician.schedule)}
					>
						<Icon as={CalendarDays} size={15} className="text-app-primary" />
						<Text variant="buttonMd" className="text-app-primary">
							Calendar
						</Text>
					</Button>
				}
			/>

			<View className="gap-stack-sm">
				{schedule.map((order) => (
					<ScheduleRow key={order.id} order={order} />
				))}
			</View>
		</View>
	);
}
