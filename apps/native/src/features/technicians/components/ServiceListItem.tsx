import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface ServiceListItemProps {
	name: string;
	description?: string | null;
	priceLabel: string;
}

/** One row in the technician's live, customer-bookable service list. A quiet
 *  row (name + muted description + price), divided by hairlines in the parent —
 *  no boxed cards. */
export function ServiceListItem({
	name,
	description,
	priceLabel,
}: ServiceListItemProps) {
	return (
		<View className="flex-row items-start justify-between gap-stack-md py-stack-sm">
			<View className="min-w-0 flex-1">
				<Text
					variant="body"
					className="font-semibold text-content"
					numberOfLines={1}
				>
					{name}
				</Text>
				{description ? (
					<Text
						variant="caption"
						className="mt-0.5 text-content-muted"
						numberOfLines={2}
					>
						{description}
					</Text>
				) : null}
			</View>
			<Text variant="caption" className="shrink-0 font-bold text-app-primary">
				{priceLabel}
			</Text>
		</View>
	);
}
