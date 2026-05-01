import { RotateCcw } from "lucide-react-native";
import {
	FlatList,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { PREVIOUS_ORDERS, type PreviousOrder } from "@/src/lib/mock-data/user";
import { spacing, useThemeColors } from "@/src/lib/theme";

const CARD_WIDTH_RATIO = 0.75;
const CARD_SPACING = spacing.stack.sm;

function OrderCard({
	item,
	cardWidth,
}: Readonly<{
	item: PreviousOrder;
	cardWidth: number;
}>) {
	const themeColors = useThemeColors();
	return (
		<View
			className="rounded-card bg-surface p-card"
			style={{
				width: cardWidth,
				marginHorizontal: CARD_SPACING / 2,
			}}
		>
			{/* Top: avatar + info + reorder button */}
			<View className="flex-row items-center">
				{/* Avatar */}
				<View
					className="mr-control-search h-control-icon-box-touch w-control-icon-box-touch items-center justify-center rounded-pill"
					style={{ backgroundColor: item.categoryColor }}
				>
					<Text variant="label" className="font-bold text-surface-on-primary">
						{item.initials}
					</Text>
				</View>

				{/* Name + category */}
				<View className="flex-1">
					<Text
						variant="label"
						className="font-semibold text-content"
						numberOfLines={1}
					>
						{item.technicianName}
					</Text>
					<Text variant="caption" className="text-content-muted">
						{item.category}
					</Text>
				</View>

				{/* Pill-shaped transparent outline button */}
				<TouchableOpacity
					activeOpacity={0.7}
					className="flex-row items-center justify-center gap-control-btn-compact rounded-pill border bg-transparent px-screen-x py-stack-sm"
					style={{
						borderColor: themeColors.borderDefault,
					}}
				>
					<RotateCcw
						size={14}
						color={themeColors.textContrast}
						strokeWidth={2.5}
						style={{ marginTop: spacing.offset.hairlineNudge }}
					/>
					<Text variant="buttonMd" className="font-bold text-content">
						Reorder
					</Text>
				</TouchableOpacity>
			</View>

			{/* Bottom row: date + price */}
			<View className="mt-control-search flex-row items-center justify-between border-t border-surface-elevated pt-stack-sm">
				<Text variant="caption" className="text-content-muted">
					{item.date}
				</Text>
				<Text variant="buttonMd" className="text-content">
					{item.price}
				</Text>
			</View>
		</View>
	);
}

export default function PreviousOrdersSection() {
	const { width } = useWindowDimensions();
	const cardWidth = width * CARD_WIDTH_RATIO;

	if (PREVIOUS_ORDERS.length === 0) return null;

	return (
		<View>
			{/* Header */}
			<View className="mb-stack-sm flex-row items-center px-screen-x">
				<Text variant="h2" className="text-content">
					Previous Orders
				</Text>
			</View>

			{/* Horizontal list – max 3, no end arrow */}
			<FlatList
				data={PREVIOUS_ORDERS.slice(0, 3)}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<OrderCard item={item} cardWidth={cardWidth} />
				)}
				horizontal
				showsHorizontalScrollIndicator={false}
				snapToInterval={cardWidth + CARD_SPACING}
				decelerationRate="fast"
				contentContainerStyle={{
					paddingHorizontal: spacing.screen.paddingX - CARD_SPACING / 2,
					paddingVertical: spacing.stack.xs,
				}}
			/>
		</View>
	);
}
