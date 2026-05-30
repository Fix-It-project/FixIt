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
}: InitialsAvatarProps) {
	const initials = computeInitials(name);

	return (
		<Avatar alt={name} className={className ?? "size-10"}>
			{imageUrl ? (
				<AvatarImage source={{ uri: imageUrl }} />
			) : null}
			<AvatarFallback>
				<Text
					variant="caption"
					className="text-foreground font-semibold"
				>
					{initials}
				</Text>
			</AvatarFallback>
		</Avatar>
	);
}
