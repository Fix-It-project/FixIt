import { MessageCircle } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

export default function ChatbotScreen() {
	return (
		<View className="flex-1 items-center justify-center bg-surface-elevated">
			<View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-app-primary-light">
				<MessageCircle size={28} color={Colors.primary} strokeWidth={1.8} />
			</View>
			<Text className="font-bold text-content text-xl">Chatbot</Text>
			<Text className="mt-2 text-content-muted text-sm">Coming soon</Text>
		</View>
	);
}
