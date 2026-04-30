import { MessageCircle } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";

export default function ChatbotScreen() {
	const themeColors = useThemeColors();
	return (
		<View className="flex-1 items-center justify-center bg-surface-elevated">
			<View
				className="mb-stack-lg h-avatar-xl w-avatar-xl items-center justify-center rounded-pill"
				style={{ backgroundColor: themeColors.primaryLight }}
			>
				<MessageCircle size={28} color={Colors.primary} strokeWidth={1.8} />
			</View>
			<Text variant="h3" className="font-bold text-content text-xl">Chatbot</Text>
			<Text variant="bodySm" className="mt-stack-sm text-content-muted text-sm">Coming soon</Text>
		</View>
	);
}
