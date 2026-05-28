// Phase 4b Plan 05 — Tech-side state-body placeholder.
//
// Mounted by `app/technician/bookings/[bookingId].tsx` (and indirectly by any
// future tech-side state-machine site) for orders whose status falls inside
// IN_PROGRESS_STATUSES. The real tech action panel (Start trip, Arrived,
// Finish inspection, Submit quote, Confirm cash received, …) ships in 4c —
// keeping this stub here lets the screen-discriminator logic in 4b remain
// fully wired today.
//
// Props mirror the user-side state body views so 4c can swap in the real
// component without touching the call site.

import { Hammer } from "lucide-react-native";
import { View } from "react-native";

import { Text } from "@/src/components/ui/text";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { useThemeColors } from "@/src/constants/design-tokens";

const ICON_SIZE = 48;
const ICON_STROKE_WIDTH = 1.5;

interface Props {
	// Accepted but not yet consumed — keeps the API symmetric with
	// `user/states/*` so 4c can drop in the real implementation by name.
	readonly order: Order;
}

export default function PlaceholderView(_props: Props) {
	const themeColors = useThemeColors();

	return (
		<View className="flex-1 items-center justify-center px-card">
			<Hammer
				size={ICON_SIZE}
				color={themeColors.textMuted}
				strokeWidth={ICON_STROKE_WIDTH}
			/>
			<Text variant="h3" className="mt-stack-lg text-center text-content">
				Full tech UI coming in 4c
			</Text>
			<Text
				variant="bodySm"
				className="mt-stack-sm text-center text-content-muted"
			>
				This order is in progress. The technician action panel ships next phase.
			</Text>
		</View>
	);
}
