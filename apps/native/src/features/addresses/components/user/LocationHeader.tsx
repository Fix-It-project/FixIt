import { ChevronDown, MapPin } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import NotificationBell from "@/src/components/ui/NotificationBell";
import { Text } from "@/src/components/ui/text";
import { useAddressesQuery } from "@/src/features/addresses/hooks/useAddressesQuery";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface LocationHeaderProps {
	readonly onLocationPress?: () => void;
}

export default function LocationHeader({
	onLocationPress,
}: LocationHeaderProps) {
	const themeColors = useThemeColors();
	const { data: addresses } = useAddressesQuery();

	const activeAddress = addresses?.find((a) => a.is_active) ?? addresses?.[0];
	const locationLabel = activeAddress
		? `${activeAddress.street}, ${activeAddress.city}`
		: "Select Location";

	return (
		<View className="flex-row items-center justify-between px-5 pt-2 pb-3">
			<TouchableOpacity
				onPress={onLocationPress}
				className="flex-row items-center gap-2 rounded-full px-3 py-2"
				style={{ backgroundColor: Colors.overlaySm }}
				activeOpacity={0.7}
			>
				<View
					className="h-8 w-8 items-center justify-center rounded-full"
					style={{ backgroundColor: Colors.overlayMd }}
				>
					<MapPin
						size={16}
						color={themeColors.onPrimaryHeader}
						strokeWidth={2}
					/>
				</View>

				<View className="shrink">
					<Text className="text-xs" style={{ color: Colors.overlayBright }}>
						Your Location
					</Text>
					<View className="flex-row items-center gap-1">
						<Text variant="body" className="font-semibold text-white" numberOfLines={1}>
							{locationLabel}
						</Text>
						<ChevronDown
							size={16}
							color={themeColors.onPrimaryHeader}
							strokeWidth={2}
						/>
					</View>
				</View>
			</TouchableOpacity>

			<NotificationBell />
		</View>
	);
}
