import { Tag } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
	QuoteChatCta,
	QuoteChatPanel,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import { space } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function QuoteView({ order }: Props) {
	const { t } = useTranslation("orders");
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Tag}
				eyebrow={t("detail.stage.quote.eyebrow")}
				title={t("detail.stage.quote.title")}
				subtitle={t("detail.stage.quote.subtitle")}
			/>
			<QuoteChatPanel order={order} viewer="user" />
		</View>
	);
}

export function QuoteViewCta({ order }: Props) {
	return <QuoteChatCta order={order} viewer="user" />;
}
