import { XCircle } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	OrderInfoCompact,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import { radius, space, useThemeColors } from "@/src/constants/design-tokens";

interface Props {
	readonly order: Order;
}

export default function CancelledView({ order }: Props) {
	const { t } = useTranslation("orders");
	const themeColors = useThemeColors();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	const reason = order.cancellation_reason?.trim();

	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={XCircle}
				eyebrow={t("detail.stage.cancelled.eyebrow")}
				title={t("detail.stage.cancelled.title")}
				subtitle={t("detail.stage.cancelled.subtitle")}
				accentColor={themeColors.danger}
			/>

			{reason ? (
				<View
					style={{
						borderRadius: radius.card,
						padding: space[4],
						backgroundColor: `${themeColors.danger}14`,
						gap: space[1],
					}}
				>
					<Text variant="caption" style={{ color: themeColors.danger }}>
						{t("detail.cancelled.reason")}
					</Text>
					<Text variant="bodySm" style={{ color: themeColors.textPrimary }}>
						{reason}
					</Text>
				</View>
			) : null}

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

			<TechnicianProfileSheet ref={profileSheetRef} />
		</View>
	);
}
