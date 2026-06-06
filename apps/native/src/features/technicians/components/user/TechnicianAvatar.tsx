import { TouchableOpacity } from "react-native";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Text } from "@/src/components/ui/text";
import { getAvatarColor } from "@/src/features/technicians/utils/technician-utils";

interface TechnicianAvatarProps {
	readonly id: string;
	readonly initials: string;
	readonly imageUrl?: string | null;
	readonly size?: "sm" | "lg";
	readonly onPress?: () => void;
}

const sizeClasses = {
	sm: "h-avatar-lg w-avatar-lg",
	lg: "h-avatar-hero w-avatar-hero",
} as const;

const variantBySize = {
	sm: "buttonLg",
	lg: "h2",
} as const;

export default function TechnicianAvatar({
	id,
	initials,
	imageUrl,
	size = "sm",
	onPress,
}: TechnicianAvatarProps) {
	const content = (
		<Avatar
			alt={initials}
			className={`${sizeClasses[size]} items-center justify-center rounded-pill`}
			style={{ backgroundColor: getAvatarColor(id) }}
		>
			{imageUrl ? <AvatarImage source={{ uri: imageUrl }} /> : null}
			<AvatarFallback className="bg-transparent">
				<Text
					variant={variantBySize[size]}
					className="font-bold text-surface-on-primary"
				>
					{initials}
				</Text>
			</AvatarFallback>
		</Avatar>
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
