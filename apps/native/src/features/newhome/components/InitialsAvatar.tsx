import type { TextStyle } from "react-native";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Text } from "@/src/components/ui/text";

interface InitialsAvatarProps {
	readonly name: string;
	readonly imageUrl?: string | null;
	readonly className?: string;
	readonly textClassName?: string;
	readonly textStyle?: TextStyle;
}

function computeInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((word) => word.charAt(0).toUpperCase())
		.join("");
}

export function InitialsAvatar({
	name,
	imageUrl,
	className,
	textClassName,
	textStyle,
}: InitialsAvatarProps) {
	const initials = computeInitials(name);

	return (
		<Avatar alt={name} className={className ?? "size-10"}>
			{imageUrl ? <AvatarImage source={{ uri: imageUrl }} /> : null}
			<AvatarFallback className="bg-app-primary">
				<Text
					variant="caption"
					className={textClassName ?? "font-semibold text-primary-foreground"}
					style={textStyle}
				>
					{initials}
				</Text>
			</AvatarFallback>
		</Avatar>
	);
}
