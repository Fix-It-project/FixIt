import { RotateCcw } from "lucide-react-native";
import {
	FlatList,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { PREVIOUS_ORDERS, type PreviousOrder } from "@/src/lib/mock-data/user";
import { useThemeColors } from "@/src/lib/theme";

const CARD_WIDTH_RATIO = 0.75;
const CARD_SPACING = 8;

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
			style={{
				width: cardWidth,
				marginHorizontal: CARD_SPACING / 2,
				borderRadius: 14,
				backgroundColor: themeColors.surfaceBase,
				padding: 14,
			}}
		>
			{/* Top: avatar + info + reorder button */}
			<View style={{ flexDirection: "row", alignItems: "center" }}>
				{/* Avatar */}
				<View
					style={{
						width: 44,
						height: 44,
						borderRadius: 22,
						backgroundColor: item.categoryColor,
						alignItems: "center",
						justifyContent: "center",
						marginRight: 10,
					}}
				>
					<Text variant="label" className="font-bold text-white">
						{item.initials}
					</Text>
				</View>

				{/* Name + category */}
				<View style={{ flex: 1 }}>
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
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						gap: 6,
						backgroundColor: "transparent",
						borderWidth: 1.5,
						borderColor: themeColors.borderDefault,
						borderRadius: 100, // Pill shape
						paddingHorizontal: 18, // Generous padding for pill proportions
						paddingVertical: 8, // A bit of height but proportional
					}}
				>
					<RotateCcw
						size={14}
						color={themeColors.textContrast}
						strokeWidth={2.5}
						style={{ marginTop: -1 }}
					/>
					<Text variant="buttonMd" className="font-bold text-content">
						Reorder
					</Text>
				</TouchableOpacity>
			</View>

			{/* Bottom row: date + price */}
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 10,
					paddingTop: 8,
					borderTopWidth: 1,
					borderTopColor: themeColors.surfaceElevated,
				}}
			>
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
			<View className="mb-2 flex-row items-center px-5">
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
					paddingHorizontal: 20 - CARD_SPACING / 2,
					paddingVertical: 4,
				}}
			/>
		</View>
	);
}
