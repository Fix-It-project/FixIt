import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Linking, TouchableOpacity, View } from "react-native";
import { AspectRatio } from "@/src/components/ui/aspect-ratio";
import { Card } from "@/src/components/ui/card";
import { Text } from "@/src/components/ui/text";

interface Props {
	readonly uri: string;
}

export default function BookingAttachmentCard({ uri }: Props) {
	const { t } = useTranslation("orders");
	return (
		<Card className="mb-stack-lg overflow-hidden">
			<View className="px-card pt-card pb-stack-md">
				<Text variant="buttonMd" className="text-content">
					{t("detail.attachment")}
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
		</Card>
	);
}
