import { Camera, User } from "lucide-react-native";
import { Image, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { getPfpInitialsFallback } from "@/src/lib/helpers/pfp-initials-fallback";
import { Colors, elevation, shadowStyle, useThemeColors } from "@/src/lib/theme";

interface ProfileAvatarProps {
	readonly name: string | null;
	readonly imageUrl?: string | null;
	readonly onChangePhoto?: () => void;
}

function AvatarContent({
	imageUrl,
	initials,
}: {
	readonly imageUrl: string | null | undefined;
	readonly initials: string | null;
}) {
	const themeColors = useThemeColors();

	if (imageUrl) {
		return (
			<Image
				source={{ uri: imageUrl }}
				className="h-avatar-2xl w-avatar-2xl rounded-pill"
				resizeMode="cover"
			/>
		);
	}

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
			<View
				className="h-avatar-2xl w-avatar-2xl items-center justify-center rounded-pill"
				style={{ backgroundColor: themeColors.overlayMd }}
			>
				<AvatarContent imageUrl={imageUrl} initials={initials} />
			</View>

			{onChangePhoto && (
				<TouchableOpacity
					onPress={onChangePhoto}
					activeOpacity={0.8}
					className="absolute right-0 bottom-0 h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-pill bg-surface"
					style={shadowStyle(elevation.raised, {
						shadowColor: Colors.shadow,
					})}
				>
					<Camera size={14} color={Colors.primary} strokeWidth={2} />
				</TouchableOpacity>
			)}
		</View>
	);
}
