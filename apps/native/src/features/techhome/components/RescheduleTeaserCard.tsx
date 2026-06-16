import { router } from "expo-router";
import { CalendarClock, ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";
import { useIncomingReschedules } from "../hooks/useTechHomeOrdersQuery";

/**
 * Conditional dashboard teaser — only appears when a customer has sent a
 * reschedule request. Deep-links straight into Jobs → Reschedules, where the
 * accept/deny lives (no duplicated action logic on the home screen).
 */
export function RescheduleTeaserCard() {
	const incoming = useIncomingReschedules();
	const open = useDebounce(() =>
		router.push(ROUTES.technician.jobsTab("reschedules")),
	);

	if (incoming.length === 0) return null;
	const count = incoming.length;

	return (
		<View className="px-screen-x pt-stack-md">
			<PressableScale
				pressedScale={0.985}
				onPress={open}
				className="flex-row items-center gap-stack-md rounded-card bg-card p-card"
				accessibilityLabel="Review reschedule requests"
			>
				<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill bg-app-primary/10">
					<Icon as={CalendarClock} size={20} className="text-app-primary" />
				</View>
				<View className="flex-1">
					<Text variant="label" className="font-bold text-content">
						{count === 1
							? "1 reschedule request"
							: `${count} reschedule requests`}
					</Text>
					<Text variant="caption" className="text-content-muted">
						Tap to review and respond.
					</Text>
				</View>
				<Icon as={ChevronRight} size={18} className="text-content-muted" />
			</PressableScale>
		</View>
	);
}
