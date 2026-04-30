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
		<View className="flex-row items-center justify-between px-screen-x pt-stack-sm pb-stack-md">
			<TouchableOpacity
				onPress={onLocationPress}
				className="flex-row items-center gap-stack-sm rounded-pill px-stack-md py-stack-sm"
				style={{ backgroundColor: Colors.overlaySm }}
				activeOpacity={0.7}
			>
				<View
					className="h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill"
					style={{ backgroundColor: Colors.overlayMd }}
				>
					<MapPin
						size={16}
						color={themeColors.onPrimaryHeader}
						strokeWidth={2}
					/>
				</View>

				<View className="shrink">
					<Text variant="caption" style={{ color: Colors.overlayBright }}>
						Your Location
					</Text>
					<View className="flex-row items-center gap-stack-xs">
						<Text
							variant="body"
							className="font-semibold text-surface-on-primary"
							numberOfLines={1}
						>
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
