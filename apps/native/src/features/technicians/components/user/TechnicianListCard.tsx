import { Clock, MapPin } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import {
	deriveTechnicianExtras,
	formatLocation,
} from "@/src/lib/helpers/technician-utils";
import { Colors, useThemeColors } from "@/src/lib/theme";
import AvailabilityBadge from "./AvailabilityBadge";
import RatingRow from "./RatingRow";
import TechnicianAvatar from "./TechnicianAvatar";

interface TechnicianListCardProps {
	readonly item: TechnicianListItem;
	readonly onPress?: () => void;
	readonly onAvatarPress?: (technicianId: string, initials: string) => void;
	readonly onBookPress?: (technicianId: string, technicianName: string) => void;
}

export default function TechnicianListCard({
	item,
	onPress,
	onAvatarPress,
	onBookPress,
}: Readonly<TechnicianListCardProps>) {
	const themeColors = useThemeColors();
	const extras = deriveTechnicianExtras(item.id);
	const initials = `${item.first_name[0]}${item.last_name[0]}`;
	const fullName = `${item.first_name} ${item.last_name}`;

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="mx-4 mb-3 overflow-hidden rounded-2xl bg-surface"
			style={{
				shadowColor: themeColors.textPrimary,
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.06,
				shadowRadius: 6,
				elevation: 2,
			}}
		>
			<View className="flex-row p-3.5">
				{/* ── Left: avatar ── */}
				<View className="mr-3 items-center">
					<TechnicianAvatar
						id={item.id}
						initials={initials}
						size="sm"
						onPress={() => onAvatarPress?.(item.id, initials)}
					/>
				</View>

				{/* ── Center: details ── */}
				<View className="flex-1">
					<Text
						className="font-bold text-[15px] text-content"
						style={{ fontFamily: "GoogleSans_700Bold" }}
						numberOfLines={1}
					>
						{fullName}
					</Text>
					<Text
						className="text-[12px] text-content-secondary"
						style={{ fontFamily: "GoogleSans_400Regular" }}
						numberOfLines={1}
					>
						{extras.specialty}
					</Text>

					<RatingRow rating={extras.rating} reviewCount={extras.reviewCount} />

					{/* Location · experience */}
					<View className="mt-0.5 flex-row items-center" style={{ gap: 4 }}>
						<MapPin
							size={11}
							color={themeColors.surfaceMuted}
							strokeWidth={2}
						/>
						<Text
							className="shrink text-[11px] text-content-muted"
							numberOfLines={1}
						>
							{formatLocation(item.distance_km, item.city, item.street)}
						</Text>
						<Text className="text-[11px] text-content-muted">·</Text>
						<Clock size={11} color={themeColors.surfaceMuted} strokeWidth={2} />
						<Text className="text-[11px] text-content-muted" numberOfLines={1}>
							{extras.yearsExp} yrs exp
						</Text>
					</View>

					<View className="mt-1.5 flex-row items-center justify-between">
						<AvailabilityBadge isAvailable={item.is_available} />

						<TouchableOpacity
							onPress={() => onBookPress?.(item.id, fullName)}
							activeOpacity={0.7}
							style={{
								backgroundColor: Colors.primary,
								paddingHorizontal: 16,
								paddingVertical: 6,
								borderRadius: 100,
							}}
						>
							<Text className="font-bold text-[12px] text-white">Book Now</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
