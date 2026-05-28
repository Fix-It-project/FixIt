import { Star } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/constants/design-tokens";

interface RatingRowProps {
	readonly rating: number | null;
	readonly reviewCount: number;
}

export default function RatingRow({ rating, reviewCount }: RatingRowProps) {
	if (reviewCount === 0 || rating === null) {
		return (
			<View className="mt-stack-xs flex-row items-center">
				<Text variant="caption" className="text-content-muted">
					No reviews yet
				</Text>
			</View>
		);
	}

	return (
		<View className="mt-stack-xs flex-row items-center gap-stack-xs">
			<Star
				size={12}
				color={Colors.ratingDefault}
				fill={Colors.ratingDefault}
				strokeWidth={0}
			/>
			<Text variant="caption" className="font-semibold text-content">
				{rating.toFixed(2)}
			</Text>
			<Text variant="caption" className="text-content-muted">
				·
			</Text>
			<Text variant="caption" className="text-content-muted">
				{reviewCount} {reviewCount === 1 ? "review" : "reviews"}
			</Text>
		</View>
	);
}
