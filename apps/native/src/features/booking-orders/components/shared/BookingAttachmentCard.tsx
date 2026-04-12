import { Image, Linking, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
	readonly uri: string;
}

export default function BookingAttachmentCard({ uri }: Props) {
	const themeColors = useThemeColors();
	return (
		<View
			className="mb-4 overflow-hidden rounded-2xl bg-surface"
			style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
		>
			<View className="px-4 pt-4 pb-3">
				<Text
					style={{
						fontFamily: "GoogleSans_600SemiBold",
						fontSize: 13,
						color: themeColors.textPrimary,
					}}
				>
					Attachment
				</Text>
			</View>
			<TouchableOpacity
				activeOpacity={0.85}
				onPress={() => Linking.openURL(uri)}
			>
				<Image
					source={{ uri }}
					style={{ width: "100%", height: 220 }}
					resizeMode="cover"
				/>
			</TouchableOpacity>
		</View>
	);
}
