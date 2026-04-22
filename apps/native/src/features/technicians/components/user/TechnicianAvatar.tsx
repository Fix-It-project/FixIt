import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { getAvatarColor } from "@/src/features/technicians/utils/technician-utils";

interface TechnicianAvatarProps {
	readonly id: string;
	readonly initials: string;
	readonly size?: "sm" | "lg";
	readonly onPress?: () => void;
}

const sizeClasses = {
	sm: "h-14 w-14",
	lg: "h-20 w-20",
} as const;

const variantBySize = {
	sm: "buttonLg",
	lg: "h2",
} as const;

export default function TechnicianAvatar({
	id,
	initials,
	size = "sm",
	onPress,
}: TechnicianAvatarProps) {
	const content = (
		<View
			className={`${sizeClasses[size]} items-center justify-center rounded-full`}
			style={{ backgroundColor: getAvatarColor(id) }}
		>
			<Text variant={variantBySize[size]} className="font-bold text-white">
				{initials}
			</Text>
		</View>
	);

	if (onPress) {
		return (
			<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
				{content}
			</TouchableOpacity>
		);
	}

	return content;
}
