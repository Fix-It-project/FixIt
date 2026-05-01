import { MessageCircle } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

export default function ChatHeader() {
  return (
    <View className="border-b border-black/5 bg-white px-5 pb-4 pt-6">
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F1FF]">
          <MessageCircle size={20} color={Colors.primary} strokeWidth={2} />
        </View>
        <View className="ml-3 flex-1">
          <Text
            className="text-[18px] text-[#10233F]"
            style={{ fontFamily: "GoogleSans_700Bold" }}
          >
            AI Assistant
          </Text>
          <Text className="mt-1 text-[13px] text-[#5B6B82]">
            Describe the issue or send a photo to get a technician recommendation.
          </Text>
        </View>
      </View>
    </View>
  );
}
