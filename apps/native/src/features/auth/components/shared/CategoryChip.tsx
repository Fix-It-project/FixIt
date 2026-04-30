import type { LucideIcon } from "lucide-react-native";
import { Check } from "lucide-react-native";
import { Pressable, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	Colors,
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/lib/theme";

interface CategoryChipProps {
	readonly label: string;
	readonly icon: LucideIcon;
	readonly color: string;
	readonly selected: boolean;
	readonly onPress: () => void;
}

/** Convert a hex colour to rgba */
function hexToRgba(hex: string, alpha: number) {
	const r = Number.parseInt(hex.slice(1, 3), 16);
	const g = Number.parseInt(hex.slice(3, 5), 16);
	const b = Number.parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

export default function CategoryChip({
	label,
	icon: Icon,
	color,
	selected,
	onPress,
}: CategoryChipProps) {
	const themeColors = useThemeColors();
	const scale = useSharedValue(1);
	const shadowOpacity = useSharedValue(0.08);

	const handlePressIn = () => {
		scale.value = withTiming(0.96, { duration: 100 });
		shadowOpacity.value = withTiming(0.15, { duration: 100 });
	};

	const handlePressOut = () => {
		scale.value = withTiming(1, { duration: 150 });
		shadowOpacity.value = withTiming(0.08, { duration: 150 });
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
		shadowOpacity: shadowOpacity.value,
	}));

	return (
		<Pressable
			onPress={onPress}
			onPressIn={handlePressIn}
			onPressOut={handlePressOut}
			android_ripple={{ color: hexToRgba(themeColors.shadow, 0.06) }}
		>
			<Animated.View
				className="mx-card my-stack-xs flex-row items-center overflow-hidden rounded-card border-focus bg-surface py-stack-md pr-card pl-0"
				style={[
					{
						borderColor: selected ? color : Colors.borderChip,
						...shadowStyle(elevation.raised, {
							shadowColor: selected ? color : Colors.shadow,
						}),
					},
					animatedStyle,
				]}
			>
				{/* Left spacing/accent bar area (no longer colored) */}
				<View className="mr-stack-md w-icon-2xs self-stretch rounded-compact" />

				{/* Icon container */}
				<View
					className="mr-card h-avatar-md w-avatar-md items-center justify-center rounded-input border"
					style={{
						backgroundColor: hexToRgba(color, selected ? 0.22 : 0.13),
						borderColor: hexToRgba(color, selected ? 0.35 : 0.18),
					}}
				>
					<Icon size={24} color={color} strokeWidth={1.75} />
				</View>

				{/* Label */}
				<Text
					variant="buttonLg"
					className="flex-1 text-content tracking-wide"
					numberOfLines={1}
				>
					{label}
				</Text>

				{/* Right badge */}
				{selected ? (
					<View
						className="h-icon-md w-icon-md items-center justify-center rounded-pill"
						style={{ backgroundColor: color }}
					>
						<Check size={13} color={Colors.surfaceBase} strokeWidth={3} />
					</View>
				) : null}
			</Animated.View>
		</Pressable>
	);
}
