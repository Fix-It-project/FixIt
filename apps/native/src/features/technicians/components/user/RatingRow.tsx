import { Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface RatingRowProps {
	readonly rating: number;
	readonly reviewCount: number;
}

export default function RatingRow({ rating, reviewCount }: RatingRowProps) {
	return (
		<View className="mt-1 flex-row items-center gap-1">
			<Star
				size={12}
				color={Colors.ratingDefault}
				fill={Colors.ratingDefault}
				strokeWidth={0}
			/>
			<Text variant="caption" className="font-semibold text-content">
				{rating}
			</Text>
			<Text variant="caption" className="text-content-muted">
				·
			</Text>
			<Text variant="caption" className="text-content-muted">
				{reviewCount} reviews
			</Text>
		</View>
	);
}
