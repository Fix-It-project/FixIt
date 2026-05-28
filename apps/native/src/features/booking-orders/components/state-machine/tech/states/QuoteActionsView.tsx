import { Tag } from "lucide-react-native";
import { useRef } from "react";
import { View } from "react-native";
import {
	CustomerInfoSheet,
	type CustomerInfoSheetHandle,
	OrderInfoCompact,
	QuoteChatCta,
	QuoteChatPanel,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type {
	Order,
	TechnicianBooking,
} from "@/src/features/booking-orders/schemas/response.schema";
import { space } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function QuoteBody({ order }: Props) {
	const booking = order as unknown as TechnicianBooking;
	const customerSheetRef = useRef<CustomerInfoSheetHandle>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Tag}
				eyebrow="Quote"
				title="Send a fair price."
				subtitle="3 rounds max. Counter or accept the customer."
			/>
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
			<QuoteChatPanel order={order} viewer="technician" />
			<CustomerInfoSheet ref={customerSheetRef} />
		</View>
	);
}

export function QuoteCta({ order }: Props) {
	return <QuoteChatCta order={order} viewer="technician" />;
}
