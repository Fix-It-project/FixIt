import { MapPin } from "lucide-react-native";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import CustomerActionsSheet, {
	type CustomerActionsSheetHandle,
} from "@/src/components/identity/CustomerActionsSheet";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { getPfpInitialsFallback } from "@/src/lib/initials";
import type { TechHomeOrder } from "../schemas/orders.schema";
import { formatEgp } from "../utils/money";

/**
 * Customer identity + payout row shared by NextJobCard and ActiveJobCard.
 * Tapping the customer opens the contact sheet (phone / address / problem),
 * which this row owns so the host cards stay declarative.
 */
export function JobCustomerRow({ order }: { order: TechHomeOrder }) {
	const { t } = useTranslation("technician");
	const sheetRef = useRef<CustomerActionsSheetHandle>(null);
	const customerName = order.user_name ?? t("home.common.customer");
	const initials = getPfpInitialsFallback(customerName);

	const openCustomerSheet = () =>
		sheetRef.current?.open({
			name: customerName,
			phone: order.user_phone ?? null,
			address: order.user_address ?? null,
			latitude: order.user_latitude ?? null,
			longitude: order.user_longitude ?? null,
			problem: order.problem_description ?? null,
		});

	return (
		<>
			<View className="flex-row items-center gap-stack-md py-stack-sm">
				<Pressable
					onPress={openCustomerSheet}
					accessibilityRole="button"
					accessibilityLabel={t("home.common.contactCustomer", {
						name: customerName,
					})}
					className="flex-1 flex-row items-center gap-stack-md"
				>
					<Avatar alt={customerName} className="h-12 w-12">
						<AvatarFallback className="bg-app-primary-light">
							<Text variant="body" className="font-bold text-app-primary">
								{initials}
							</Text>
						</AvatarFallback>
					</Avatar>
					<View className="flex-1">
						<Text
							variant="body"
							className="font-bold text-content"
							numberOfLines={1}
						>
							{customerName}
						</Text>
						<Text
							variant="caption"
							className="text-content-muted"
							numberOfLines={1}
						>
							{order.service_name ??
								order.problem_description ??
								t("home.common.service")}
						</Text>
						{order.user_address ? (
							<View className="mt-1 flex-row items-center gap-1">
								<Icon
									as={MapPin}
									size={13}
									className="text-content-secondary"
								/>
								<Text
									variant="caption"
									className="text-content-secondary"
									numberOfLines={1}
								>
									{order.user_address}
								</Text>
							</View>
						) : null}
					</View>
				</Pressable>
				{order.final_price == null ? null : (
					<View className="items-end">
						<Text variant="caption" className="text-content-muted">
							{t("home.common.payout")}
						</Text>
						<Text variant="body" className="font-bold text-content">
							{formatEgp(order.final_price)}
						</Text>
					</View>
				)}
			</View>
			<CustomerActionsSheet ref={sheetRef} />
		</>
	);
}
