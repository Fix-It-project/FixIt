import { Tag } from "lucide-react-native";
import { View } from "react-native";
import { space } from "@/src/constants/design-tokens";
import {
	QuoteChatCta,
	QuoteChatPanel,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";

interface Props {
	readonly order: Order;
}

export default function QuoteBody({ order }: Props) {
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Tag}
				eyebrow="Quote"
				title="Send a fair price."
				subtitle="3 rounds max. Counter or accept the customer."
			/>
			<QuoteChatPanel order={order} viewer="technician" />
		</View>
	);
}

export function QuoteCta({ order }: Props) {
	return <QuoteChatCta order={order} viewer="technician" />;
}
