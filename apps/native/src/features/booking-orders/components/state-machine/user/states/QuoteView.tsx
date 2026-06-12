import { Tag } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
	OrderInfoCompact,
	QuoteChatCta,
	QuoteChatPanel,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { space } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function QuoteView({ order }: Props) {
	const { t } = useTranslation("orders");
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Tag}
				eyebrow={t("detail.stage.quote.eyebrow")}
				title={t("detail.stage.quote.title")}
				subtitle={t("detail.stage.quote.subtitle")}
			/>
			<OrderInfoCompact
				order={order}
				viewer="user"
				onIdentityPress={() =>
					profileSheetRef.current?.open(
						order.technician_id,
						getPfpInitialsFallback(order.technician_name),
					)
				}
			/>
			<QuoteChatPanel order={order} viewer="user" />
			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}

export function QuoteViewCta({ order }: Props) {
	return <QuoteChatCta order={order} viewer="user" />;
}
