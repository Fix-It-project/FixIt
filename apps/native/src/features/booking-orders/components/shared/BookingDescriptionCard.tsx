import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
interface Props {
	readonly description: string;
}

export default function BookingDescriptionCard({ description }: Props) {
	return (
		<View className="mb-stack-lg rounded-card border border-edge bg-surface p-card">
			<Text
				variant="buttonMd"
				className="mb-stack-sm text-content"
			>
				Problem Description
			</Text>
			<Text variant="bodySm" className="text-content-secondary">
				{description}
			</Text>
		</View>
	);
}
