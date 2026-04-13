import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { MessageCircle } from "lucide-react-native";
import { Colors, useThemeColors } from "@/src/lib/theme";

export default function ChatbotScreen() {
  const themeColors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center bg-surface-elevated">
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: themeColors.primaryLight }}
      >
        <MessageCircle size={28} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <Text className="text-xl font-bold text-content">Chatbot</Text>
      <Text className="mt-2 text-sm text-content-muted">Coming soon</Text>
    </View>
  );
}
