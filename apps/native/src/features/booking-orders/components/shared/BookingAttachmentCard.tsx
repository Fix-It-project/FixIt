import {
	Image,
	Linking,
	TouchableOpacity,
	useWindowDimensions,
	View,
} from "react-native";
import { Text } from "@/src/components/ui/text";

interface Props {
	readonly uri: string;
}

export default function BookingAttachmentCard({ uri }: Props) {
	const { width } = useWindowDimensions();
	const imageHeight = Math.max(180, Math.min(width * 0.58, 280));
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
				<Image
					source={{ uri }}
					style={{ width: "100%", height: imageHeight }}
					resizeMode="cover"
				/>
			</TouchableOpacity>
		</View>
	);
}
