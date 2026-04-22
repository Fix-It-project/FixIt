import { Clock, MapPin } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { TechnicianListItem } from "@/src/features/technicians/schemas/response.schema";
import {
	deriveTechnicianExtras,
	formatLocation,
} from "@/src/features/technicians/utils/technician-utils";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import {
	elevation,
	shadowStyle,
	spacing,
	useThemeColors,
} from "@/src/lib/theme";
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
	const fullName = `${item.first_name} ${item.last_name}`;
	const initials = getPfpInitialsFallback(fullName);

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			className="mx-4 mb-3 overflow-hidden rounded-card bg-surface"
			style={{
				...shadowStyle(elevation.flat, {
					shadowColor: themeColors.textPrimary,
					opacity: 0.06,
				}),
			}}
		>
			<View className="flex-row p-card-compact">
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
						variant="buttonLg"
						className="font-bold text-content"
						numberOfLines={1}
					>
						{fullName}
					</Text>
					<Text
						variant="caption"
						className="text-content-secondary"
						numberOfLines={1}
					>
						{extras.specialty}
					</Text>

					<RatingRow rating={extras.rating} reviewCount={extras.reviewCount} />

					{/* Location · experience */}
					<View className="mt-0.5 flex-row items-center gap-1">
						<MapPin
							size={spacing.icon.xs}
							color={themeColors.surfaceMuted}
							strokeWidth={2}
						/>
						<Text
							variant="caption"
							className="shrink text-content-muted"
							numberOfLines={1}
						>
							{formatLocation(item.distance_km, item.city, item.street)}
						</Text>
						<Text variant="caption" className="text-content-muted">
							·
						</Text>
						<Clock
							size={spacing.icon.xs}
							color={themeColors.surfaceMuted}
							strokeWidth={2}
						/>
						<Text
							variant="caption"
							className="text-content-muted"
							numberOfLines={1}
						>
							{extras.yearsExp} yrs exp
						</Text>
					</View>

					<View className="mt-1.5 flex-row items-center justify-between">
						<AvailabilityBadge isAvailable={item.is_available} />

						<TouchableOpacity
							onPress={() => onBookPress?.(item.id, fullName)}
							activeOpacity={0.7}
							className="rounded-pill bg-app-primary px-control-pill-x py-control-pill-y"
						>
							<Text variant="caption" className="font-bold text-white">
								Book Now
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
}
