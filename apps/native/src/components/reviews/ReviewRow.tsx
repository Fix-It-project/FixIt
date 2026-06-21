import { Star } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { formatRelativeTime } from "@/src/lib/date/relative-time";
import type { Review } from "./types";

export type ReviewRowVariant = "card" | "row" | "preview";

interface Props {
	readonly review: Review;
	readonly variant?: ReviewRowVariant;
}

const NAME_VARIANT: Record<ReviewRowVariant, "buttonLg" | "buttonMd"> = {
	card: "buttonLg",
	row: "buttonMd",
	preview: "buttonMd",
};

export default function ReviewRow({ review, variant = "row" }: Props) {
	const { t, i18n } = useTranslation("reviews");
	const themeColors = useThemeColors();
	const rating = review.rating ?? 0;

	const nonCardClassName =
		variant === "preview" ? "py-stack-sm" : "py-stack-md";
	const containerClassName =
		variant === "card" ? "rounded-card p-card" : nonCardClassName;

	const nonCardStyle =
		variant === "row"
			? { borderBottomWidth: 1, borderBottomColor: themeColors.borderDefault }
			: undefined;
	const containerStyle =
		variant === "card"
			? { backgroundColor: themeColors.surfaceElevated }
			: nonCardStyle;

	const commentLines = variant === "preview" ? 2 : undefined;

	return (
		<View className={containerClassName} style={containerStyle}>
			<View className="flex-row items-center justify-between">
				<Text
					variant={NAME_VARIANT[variant]}
					className="flex-1 text-content"
					numberOfLines={1}
				>
					{review.reviewer_name ?? t("anonymous")}
				</Text>
				<Text variant="caption" className="ml-stack-sm text-content-muted">
					{formatRelativeTime(review.created_at, new Date(), i18n.language)}
				</Text>
			</View>

			{review.rating !== null && (
				<View className="mt-stack-xs flex-row gap-stack-xs">
					{[1, 2, 3, 4, 5].map((star) => (
						<Star
							key={star}
							size={14}
							color={themeColors.ratingDefault}
							fill={star <= rating ? themeColors.ratingDefault : "transparent"}
							strokeWidth={1.5}
						/>
					))}
				</View>
			)}

			{!!review.comment && (
				<Text
					variant="bodySm"
					className="mt-stack-xs text-content-secondary"
					numberOfLines={commentLines}
				>
					{review.comment}
				</Text>
			)}
		</View>
	);
}
