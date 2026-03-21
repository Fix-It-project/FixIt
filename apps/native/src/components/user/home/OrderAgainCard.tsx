import { RotateCcw } from "lucide-react-native";
import {
	FlatList,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import SectionHeader from "@/src/components/user/home/SectionHeader";
import { Colors } from "@/src/lib/colors";
import { PREVIOUS_ORDERS, type PreviousOrder } from "@/src/lib/mock-data/user";

const CARD_WIDTH_RATIO = 0.75;
const CARD_SPACING = 8;

function OrderCard({
	item,
	cardWidth,
}: {
	item: PreviousOrder;
	cardWidth: number;
}) {
	return (
		<View
			style={{
				width: cardWidth,
				marginHorizontal: CARD_SPACING / 2,
				borderRadius: 14,
				backgroundColor: Colors.surfaceLight,
				padding: 14,
				shadowColor: Colors.shadow,
				shadowOffset: { width: 0, height: 3 },
				shadowOpacity: 0.07,
				shadowRadius: 8,
				elevation: 2,
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
					<Text className="font-bold text-[14px] text-white">
						{item.initials}
					</Text>
				</View>

				{/* Name + category */}
				<View style={{ flex: 1 }}>
					<Text
						className="font-semibold text-[14px] text-content"
						style={{ fontFamily: "GoogleSans_600SemiBold" }}
						numberOfLines={1}
					>
						{item.technicianName}
					</Text>
					<Text className="text-[12px] text-content-muted">
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
						borderColor: Colors.borderLight,
						borderRadius: 100,
						paddingHorizontal: 18,
						paddingVertical: 8,
					}}
				>
					<RotateCcw
						size={14}
						color={Colors.darkText}
						strokeWidth={2.5}
						style={{ marginTop: -1 }}
					/>
					<Text
						className="font-bold text-[13px] text-content"
						style={{ fontFamily: "GoogleSans_700Bold", lineHeight: 16 }}
					>
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
					borderTopColor: Colors.borderLight,
				}}
			>
				<Text className="text-[12px] text-content-muted">{item.date}</Text>
				<Text
					className="font-semibold text-[13px] text-content"
					style={{ fontFamily: "GoogleSans_600SemiBold" }}
				>
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
		<Animated.View entering={FadeInDown.delay(440).duration(400)}>
			<SectionHeader title="Order Again" />
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
		</Animated.View>
	);
}
