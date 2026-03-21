import { ChevronDown, MapPin } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import NotificationBell from "@/src/components/ui/NotificationBell";
import { Text } from "@/src/components/ui/text";
import { useAddressesQuery } from "@/src/hooks/addresses/useAddressesQuery";
import { Colors } from "@/src/lib/colors";

interface LocationHeaderProps {
	onLocationPress?: () => void;
}

function getGreeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning!";
	if (hour < 17) return "Good afternoon!";
	return "Good evening!";
}

export default function LocationHeader({
	onLocationPress,
}: LocationHeaderProps) {
	const { data: addresses } = useAddressesQuery();

	const activeAddress = addresses?.find((a) => a.is_active) ?? addresses?.[0];
	const locationLabel = activeAddress
		? `${activeAddress.street}, ${activeAddress.city}`
		: "Select Location";

	return (
		<View className="flex-row items-center justify-between px-5 pt-2 pb-3">
			<Animated.View entering={FadeInDown.duration(350)}>
				<Text
					className="font-semibold text-xs"
					style={{ color: Colors.overlayBright }}
				>
					{getGreeting()}
				</Text>
				<TouchableOpacity
					onPress={onLocationPress}
					className="mt-1 flex-row items-center gap-2 rounded-full px-3 py-2"
					style={{ backgroundColor: Colors.overlaySm }}
					activeOpacity={0.7}
				>
					<View
						className="h-8 w-8 items-center justify-center rounded-full"
						style={{ backgroundColor: Colors.overlayMd }}
					>
						<MapPin size={16} color={Colors.white} strokeWidth={2} />
					</View>

					<View className="shrink">
						<Text className="text-xs" style={{ color: Colors.overlayBright }}>
							Your Location
						</Text>
						<View className="flex-row items-center gap-1">
							<Text
								className="font-semibold text-[15px] text-white"
								style={{ fontFamily: "GoogleSans_600SemiBold" }}
								numberOfLines={1}
							>
								{locationLabel}
							</Text>
							<ChevronDown size={16} color={Colors.white} strokeWidth={2} />
						</View>
					</View>
				</TouchableOpacity>
			</Animated.View>

			<NotificationBell />
		</View>
	);
}
