// Phase 4c Plan 03 — Tech CompletedView.
//
// Terminal "happy path" body. No review CTA — tech doesn't leave reviews.
// Shows the completed status banner + client/info cards for reference,
// plus a Done button that returns to the bookings list.

import { router } from "expo-router";
import { useCallback } from "react";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	BookingClientCard,
	BookingInfoSection,
} from "@/src/features/booking-orders/components/tech";
import OrderStatusBanner from "@/src/features/booking-orders/components/user/OrderStatusBanner";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { PressableScale } from "@/src/components/animation/pressable-scale";
import { ROUTES } from "@/src/lib/navigation";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function CompletedView({ order }: Props) {
	const themeColors = useThemeColors();
	const booking = order as unknown as TechnicianBooking;

	const handleDone = useCallback(() => {
		router.replace(ROUTES.technician.bookings);
	}, []);

	return (
		<View style={{ padding: spacing.card.padding, gap: spacing.stack.lg }}>
			<OrderStatusBanner status="completed" />
			<BookingClientCard booking={booking} />
			<BookingInfoSection booking={booking} />

			<PressableScale
				onPress={handleDone}
				accessibilityRole="button"
				accessibilityLabel="Done"
			>
				<View
					className="w-full items-center rounded-button px-button-x py-control-cta-y"
					style={{ backgroundColor: themeColors.primary }}
				>
					<Text
						variant="buttonLg"
						className="font-google-sans-bold"
						style={{ color: themeColors.onPrimaryHeader }}
					>
						Done
					</Text>
				</View>
			</PressableScale>
		</View>
	);
}
