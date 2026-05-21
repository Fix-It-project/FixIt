import { Search } from "lucide-react-native";
import { useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	OrderInfoCompact,
	StageHero,
} from "@/src/features/booking-orders/components/state-machine/shared";
import type { Order } from "@/src/features/booking-orders/schemas/response.schema";
import TechnicianProfileSheet, {
	type TechnicianProfileSheetRef,
} from "@/src/components/identity/TechnicianProfileSheet";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { radius, space, useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly order: Order;
}

export default function ArrivedInspectingView({ order }: Props) {
	const themeColors = useThemeColors();
	const profileSheetRef = useRef<TechnicianProfileSheetRef>(null);
	return (
		<View style={{ gap: space[5] }}>
			<StageHero
				icon={Search}
				eyebrow="On site"
				title="Inspection in progress."
				subtitle="A fair quote arrives once the scope is clear."
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
					Inspecting your problem…
				</Text>
			</View>
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

export function ArrivedInspectingViewCta(_props: Props): null {
	return null;
}
