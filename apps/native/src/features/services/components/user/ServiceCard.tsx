import { ChevronRight } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import type { Service } from "@/src/features/services/schemas/response.schema";
import { elevation, shadowStyle, spacing, useThemeColors } from "@/src/lib/theme";

function formatPrice(min: number, max: number): string {
	if (min === max) return `${min} EGP`;
	return `${min} – ${max} EGP`;
}

interface ServiceCardProps {
	readonly service: Service;
	readonly accentColor: string;
	readonly onPress: (serviceId: string, serviceName: string) => void;
}

export default function ServiceCard({
	service,
	accentColor,
	onPress,
}: ServiceCardProps) {
	const themeColors = useThemeColors();
	return (
		<TouchableOpacity
			className="mb-3 overflow-hidden rounded-card bg-surface"
			style={shadowStyle(elevation.raised, { shadowColor: themeColors.shadow })}
			onPress={() => onPress(service.id, service.name)}
			activeOpacity={0.7}
		>
			<View className="flex-row items-center p-card">
				{/* Color accent bar */}
				<View
					className="mr-3.5 h-btn-lg w-1 rounded-pill"
					style={{ backgroundColor: accentColor }}
				/>

				{/* Content */}
				<View className="flex-1">
					<Text
						variant="body"
						className="font-bold text-content"
						numberOfLines={1}
					>
						{service.name}
					</Text>
					{service.description ? (
						<Text
							variant="bodySm"
							className="mt-0.5 text-content-muted"
							numberOfLines={2}
						>
							{service.description}
						</Text>
					) : null}
					<Text
						variant="bodySm"
						className="mt-1.5 font-semibold"
						style={{ color: accentColor }}
					>
						{formatPrice(service.min_price, service.max_price)}
					</Text>
				</View>

				{/* Arrow */}
				<ChevronRight
					size={spacing.icon.sm}
					color={themeColors.surfaceMuted}
					strokeWidth={1.75}
				/>
			</View>
		</TouchableOpacity>
	);
}
