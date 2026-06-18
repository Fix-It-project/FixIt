import { CreditCard, Wallet } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";

interface PaymentMethodBadgeProps {
	readonly method: "cash" | "card" | null | undefined;
	readonly className?: string;
}

/** Small pill showing how the order is/was paid (cash vs card). Renders nothing
 *  for an unknown method. */
export function PaymentMethodBadge({
	method,
	className,
}: PaymentMethodBadgeProps) {
	const { t } = useTranslation("orders");
	if (method !== "cash" && method !== "card") return null;
	const isCard = method === "card";

	return (
		<View
			className={`flex-row items-center gap-1 rounded-pill border border-edge px-stack-sm py-0.5 ${className ?? ""}`}
		>
			<Icon
				as={isCard ? CreditCard : Wallet}
				size={12}
				className="text-content-secondary"
			/>
			<Text variant="caption" className="text-content-secondary">
				{t(`payment_methods.${method}` as Parameters<typeof t>[0])}
			</Text>
		</View>
	);
}
