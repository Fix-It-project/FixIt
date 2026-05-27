import { Check, Search } from "lucide-react-native";
import { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import {
	CustomerInfoSheet,
	type CustomerInfoSheetHandle,
	OrderInfoCompact,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import { useTechFinishInspection } from "@/src/features/booking-orders/hooks";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { radius, space, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function ArrivedInspectingBody({ order }: Props) {
	const themeColors = useThemeColors();
	const booking = order as unknown as TechnicianBooking;
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Search}
				eyebrow="On site"
				title="Scope the work."
				subtitle="Inspect carefully. Quote should reflect parts + labor."
			/>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					gap: space[3],
					padding: space[3],
					borderRadius: radius.button,
					backgroundColor: `${themeColors.primary}10`,
				}}
			>
				<ActivityIndicator size="small" color={themeColors.primary} />
				<Text
					variant="bodySm"
					className="font-google-sans-bold"
					style={{ color: themeColors.primary, flex: 1 }}
				>
					Inspection in progress…
				</Text>
			</View>
			<OrderInfoCompact
				order={order}
				viewer="technician"
				onIdentityPress={() =>
					customerSheetRef.current?.open({
						name: booking.user_name ?? "Customer",
						phone: booking.user_phone ?? null,
						address: booking.user_address ?? null,
						problem: order.problem_description ?? null,
					})
				}
			/>
			<CustomerInfoSheet ref={customerSheetRef} />
		</View>
	);
}

export function ArrivedInspectingCta({ order }: Props) {
	const finishInspection = useTechFinishInspection();
	const handlePress = () => {
		finishInspection.mutate({ orderId: order.id });
	};
	return (
		<Button
			variant="primary"
			size="lg"
			fullWidth
			iconLeft={Check}
			loading={finishInspection.isPending}
			onPress={handlePress}
			accessibilityLabel="Finish inspection"
		>
			{"Finish inspection"}
		</Button>
	);
}
