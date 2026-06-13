import { useRouter } from "expo-router";
import { CalendarDays, MapPin } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { ROUTES } from "@/src/lib/navigation";
import { useTodaySchedule } from "../hooks/useTechHomeOrdersQuery";
import {
	ACTIVE_JOB_STATUSES,
	type TechHomeOrder,
} from "../schemas/orders.schema";
import { formatEgp } from "../utils/money";
import { EmptyState } from "./EmptyState";
import { SectionHeader } from "./SectionHeader";

type SlotState = "done" | "progress" | "upcoming";

function slotState(order: TechHomeOrder): SlotState {
	if (order.status === "completed") return "done";
	if (ACTIVE_JOB_STATUSES.has(order.status)) return "progress";
	return "upcoming";
}

function slotTime(order: TechHomeOrder): string {
	return order.scheduled_start_at
		? order.scheduled_start_at.slice(11, 16)
		: "—";
}

function TimelineRow({
	order,
	isLast,
}: {
	order: TechHomeOrder;
	isLast: boolean;
}) {
	const state = slotState(order);
	const dotClass =
		state === "done"
			? "bg-content-muted"
			: state === "progress"
				? "bg-app-primary"
				: "bg-warning";

	return (
		<View
			className={`flex-row gap-stack-md py-stack-sm ${
				isLast ? "" : "border-edge border-b border-dashed"
			}`}
		>
			{/* time column */}
			<View className="w-12 items-end">
				<Text
					variant="label"
					className={`font-bold ${
						state === "progress" ? "text-app-primary" : "text-content"
					}`}
				>
					{slotTime(order)}
				</Text>
				<Text variant="caption" className="text-content-muted uppercase">
					{state === "done" ? "done" : state === "progress" ? "now" : "next"}
				</Text>
			</View>

			{/* timeline dot + connector */}
			<View className="w-3 items-center">
				<View className={`mt-1 h-3 w-3 rounded-full ${dotClass}`} />
				{isLast ? null : (
					<View className="mt-1 w-0.5 flex-1 bg-surface-muted" />
				)}
			</View>

			{/* details */}
			<View className="flex-1">
				<Text
					variant="bodySm"
					className={`font-semibold ${
						state === "done"
							? "text-content-muted line-through"
							: "text-content"
					}`}
					numberOfLines={1}
				>
					{order.service_name ?? order.problem_description ?? "Job"}
					{order.user_name ? ` · ${order.user_name}` : ""}
				</Text>
				{order.user_address ? (
					<View className="mt-0.5 flex-row items-center gap-1">
						<Icon as={MapPin} size={12} className="text-content-muted" />
						<Text
							variant="caption"
							className="text-content-muted"
							numberOfLines={1}
						>
							{order.user_address}
						</Text>
					</View>
				) : null}
			</View>

			{order.final_price == undefined ? null : (
				<Text variant="label" className="font-bold text-content">
					{formatEgp(order.final_price)}
				</Text>
			)}
		</View>
	);
}

export function ScheduleTimeline() {
	const router = useRouter();
	const schedule = useTodaySchedule();

	return (
		<View className="px-screen-x pt-stack-lg">
			<SectionHeader
				title="Today's schedule"
				hint={
					schedule.length > 0
						? `${schedule.length} ${schedule.length === 1 ? "job" : "jobs"} today`
						: "Nothing booked for today"
				}
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

			{schedule.length === 0 ? (
				<EmptyState
					title="Free day"
					body="Accepted jobs scheduled for today will line up here."
				/>
			) : (
				<Card elevated className="px-card py-stack-xs">
					{schedule.map((order, i) => (
						<TimelineRow
							key={order.id}
							order={order}
							isLast={i === schedule.length - 1}
						/>
					))}
				</Card>
			)}
		</View>
	);
}
