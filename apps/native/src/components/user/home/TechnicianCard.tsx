import { MapPin, Star } from "lucide-react-native";
import { Image, Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { Badge } from "@/src/components/ui/badge";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import type { Technician } from "@/src/lib/mock-data/user";

export const CARD_WIDTH_RATIO = 0.75;
export const CARD_SPACING = 6;

const AVATAR_SIZE = 68;
const AVATAR_OVERLAP = AVATAR_SIZE / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TechnicianCardProps {
	item: Technician;
	cardWidth: number;
	showReviewCount?: boolean;
	showDistance?: boolean;
}

export default function TechnicianCard({
	item,
	cardWidth,
	showReviewCount = false,
	showDistance = false,
}: TechnicianCardProps) {
	const scale = useSharedValue(1);
	const animStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<AnimatedPressable
			style={[
				{
					width: cardWidth,
					marginHorizontal: CARD_SPACING / 2,
					shadowColor: Colors.shadow,
					shadowOffset: { width: 0, height: 3 },
					shadowOpacity: 0.08,
					shadowRadius: 8,
					elevation: 3,
				},
				animStyle,
			]}
			onPressIn={() => {
				scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
			}}
			onPressOut={() => {
				scale.value = withSpring(1, { damping: 15, stiffness: 300 });
			}}
		>
			{/* Cover Image with Top Rated badge */}
			<View>
				<Image
					source={item.coverImage}
					className="rounded-[14px]"
					style={{
						width: "100%",
						height: cardWidth * 0.6,
					}}
					resizeMode="cover"
				/>
				{item.rating >= 4.8 && (
					<Badge
						variant="default"
						size="sm"
						className="absolute top-2 right-2 flex-row items-center gap-0.5"
					>
						<Star
							size={9}
							color={Colors.white}
							fill={Colors.white}
							strokeWidth={0}
						/>
						<Text>Top Rated</Text>
					</Badge>
				)}
			</View>

			{/* Avatar overlapping bottom of cover */}
			<View
				style={{
					marginTop: -AVATAR_OVERLAP,
					paddingLeft: 12,
				}}
			>
				<View
					style={{
						width: AVATAR_SIZE,
						height: AVATAR_SIZE,
						borderRadius: AVATAR_SIZE / 2,
						backgroundColor: item.avatarColor,
						alignItems: "center",
						justifyContent: "center",
						borderWidth: 2,
						borderColor: Colors.surfaceLight,
					}}
				>
					<Text className="font-bold text-[18px] text-white">
						{item.initials}
					</Text>
				</View>
			</View>

			{/* Info below avatar */}
			<View className="mt-1 pr-2 pl-3">
				<Text
					className="font-semibold text-[16px] text-content"
					style={{ fontFamily: "GoogleSans_600SemiBold" }}
					numberOfLines={1}
				>
					{item.name}
				</Text>
				<View className="mt-px flex-row items-center gap-1.5">
					<Text
						className="shrink text-[13px] text-content-muted"
						numberOfLines={1}
					>
						{item.category}
					</Text>
					<View className="flex-row items-center gap-0.5">
						<Star
							size={11}
							color={Colors.star}
							fill={Colors.star}
							strokeWidth={0}
						/>
						<Text className="font-semibold text-[13px] text-content">
							{item.rating}
						</Text>
						{showReviewCount && (
							<Text className="text-[11px] text-content-muted">
								({item.reviewCount})
							</Text>
						)}
					</View>
					{showDistance && item.distance && (
						<View className="flex-row items-center gap-0.5">
							<MapPin size={11} color={Colors.textMuted} strokeWidth={2} />
							<Text className="text-[11px] text-content-muted">
								{item.distance}
							</Text>
						</View>
					)}
				</View>
				<Text
					className="mt-px text-[13px] text-content-muted"
					numberOfLines={1}
				>
					{item.tagline}
				</Text>
			</View>
		</AnimatedPressable>
	);
}
