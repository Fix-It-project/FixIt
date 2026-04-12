import { MapPin } from "lucide-react-native";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import type { Address } from "@/src/features/addresses/schemas/response.schema";
import { useThemeColors } from "@/src/lib/theme";

interface AddressListItemProps {
	address: Address;
	isActive: boolean;
	onPress: () => void;
	disabled?: boolean;
}

export default function AddressListItem({
	address,
	isActive,
	onPress,
	disabled = false,
}: AddressListItemProps) {
	const themeColors = useThemeColors();
	const activeColor = themeColors.primary;
	const active = useSharedValue(isActive ? 1 : 0);

	useEffect(() => {
		active.value = withTiming(isActive ? 1 : 0, { duration: 200 });
	}, [isActive, active]);

	const ringStyle = useAnimatedStyle(() => ({
		borderColor: interpolateColor(
			active.value,
			[0, 1],
			[themeColors.borderDefault, activeColor],
		),
		backgroundColor: interpolateColor(
			active.value,
			[0, 1],
			["transparent", activeColor],
		),
	}));

	const dotStyle = useAnimatedStyle(() => ({
		opacity: active.value,
		transform: [{ scale: active.value }],
	}));

	const detailParts = [address.building_no, address.apartment_no].filter(
		Boolean,
	);

	return (
		<TouchableOpacity
			onPress={onPress}
			disabled={disabled || isActive}
			activeOpacity={0.7}
			className="flex-row items-center py-3.5"
			style={{ gap: 12, opacity: disabled ? 0.5 : 1 }}
		>
			<View
				className="h-10 w-10 items-center justify-center rounded-full"
				style={{ backgroundColor: themeColors.surfaceElevated }}
			>
				<MapPin size={18} color={themeColors.textSecondary} strokeWidth={2} />
			</View>

			<View className="flex-1">
				<Text
					className="text-[15px] text-content"
					style={{ fontFamily: "GoogleSans_600SemiBold" }}
					numberOfLines={1}
				>
					{address.city}
				</Text>
				<Text
					className="mt-0.5 text-[13px] text-content-secondary"
					style={{ fontFamily: "GoogleSans_400Regular" }}
					numberOfLines={2}
				>
					{address.street}
					{detailParts.length > 0 ? `, ${detailParts.join(", ")}` : ""}
				</Text>
			</View>

			<Animated.View
				className="h-5 w-5 items-center justify-center rounded-full"
				style={[
					{ borderWidth: 2, borderColor: themeColors.borderDefault },
					ringStyle,
				]}
			>
				<Animated.View
					className="h-2.5 w-2.5 rounded-full"
					style={[{ backgroundColor: themeColors.surfaceBase }, dotStyle]}
				/>
			</Animated.View>
		</TouchableOpacity>
	);
}
