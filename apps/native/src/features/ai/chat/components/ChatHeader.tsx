import { MessageCircle } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";

export default function ChatHeader() {
  const themeColors = useThemeColors();

  return (
    <View
      className="px-5 pb-4 pt-6"
      style={{
        backgroundColor: themeColors.surfaceBase,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.borderDefault,
      }}
    >
      <View className="flex-row items-center">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: themeColors.primaryLight }}
        >
          <MessageCircle size={20} color={Colors.primary} strokeWidth={2} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-[18px]" style={{ fontFamily: "GoogleSans_700Bold", color: themeColors.textPrimary }}>
            AI Assistant
          </Text>
          <Text className="mt-1 text-[13px]" style={{ color: themeColors.textSecondary }}>
            Describe the issue or send a photo to get a technician recommendation.
          </Text>
        </View>
      </View>
    </View>
  );
}
