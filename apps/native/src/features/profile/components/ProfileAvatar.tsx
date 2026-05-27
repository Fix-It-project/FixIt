import { Camera, User } from "lucide-react-native";
import { View } from "react-native";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import {
	Colors,
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/lib/theme";

interface ProfileAvatarProps {
	readonly name: string | null;
	readonly imageUrl?: string | null;
	readonly onChangePhoto?: () => void;
}

function AvatarContent({ initials }: { readonly initials: string | null }) {
	const themeColors = useThemeColors();

	if (initials) {
		return (
			<Text variant="h1" className="font-bold text-surface-on-primary">
				{initials}
			</Text>
		);
	}

	return <User size={44} color={themeColors.surfaceBase} strokeWidth={1.5} />;
}

export default function ProfileAvatar({
	name,
	imageUrl,
	onChangePhoto,
}: ProfileAvatarProps) {
	const themeColors = useThemeColors();
	const initials = getPfpInitialsFallback(name);

	return (
		<View className="relative h-avatar-2xl w-avatar-2xl">
			<Avatar
				alt={name ?? "Profile photo"}
				className="h-avatar-2xl w-avatar-2xl items-center justify-center rounded-pill"
				style={{ backgroundColor: themeColors.overlayMd }}
			>
				{imageUrl ? (
					<AvatarImage
						source={{ uri: imageUrl }}
						className="h-avatar-2xl w-avatar-2xl rounded-pill"
					/>
				) : null}
				<AvatarFallback className="bg-transparent">
					<AvatarContent initials={initials} />
				</AvatarFallback>
			</Avatar>

			{onChangePhoto && (
				<Button
					variant="secondary"
					size="icon"
					onPress={onChangePhoto}
					accessibilityLabel="Change profile photo"
					className="absolute right-0 bottom-0 h-control-icon-box-sm w-control-icon-box-sm rounded-pill bg-surface"
					style={shadowStyle(elevation.raised, {
						shadowColor: Colors.shadow,
					})}
					iconLeft={<Camera size={14} color={Colors.primary} strokeWidth={2} />}
				/>
			)}
		</View>
	);
}
