import { Image } from "expo-image";
import { Linking, TouchableOpacity, View } from "react-native";
import { AspectRatio } from "@/src/components/ui/aspect-ratio";
import { Text } from "@/src/components/ui/text";

interface Props {
	readonly uri: string;
}

export default function BookingAttachmentCard({ uri }: Props) {
	return (
		<View className="mb-stack-lg overflow-hidden rounded-card border border-edge bg-surface">
			<View className="px-card pt-card pb-stack-md">
				<Text variant="buttonMd" className="text-content">
					Attachment
				</Text>
			</View>
			<TouchableOpacity
				activeOpacity={0.85}
				onPress={() => Linking.openURL(uri)}
			>
				<AspectRatio ratio={16 / 9}>
					<Image source={{ uri }} contentFit="cover" style={{ flex: 1 }} />
				</AspectRatio>
			</TouchableOpacity>
		</View>
	);
}
