import { ActivityIndicator, Image, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Bot, Camera, ImagePlus, Sparkles, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";
import type { ChatFlow, SelectedImage } from "../types";

type Props = {
  message: string;
  onMessageChange: (value: string) => void;
  selectedImage: SelectedImage | null;
  onClearImage: () => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onRecommend: () => void;
  onAgent: () => void;
  canRecommend: boolean;
  canUseAgent: boolean;
  isLoading: boolean;
  activeFlow: ChatFlow | null;
};

export default function ChatComposer({
  message,
  onMessageChange,
  selectedImage,
  onClearImage,
  onPickImage,
  onTakePhoto,
  onRecommend,
  onAgent,
  canRecommend,
  canUseAgent,
  isLoading,
  activeFlow,
}: Props) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();

  return (
    <KeyboardAvoidingView behavior="height">
      <View
        className="border-t border-black/5 bg-white px-4 pt-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {selectedImage ? (
          <View className="mb-3 rounded-2xl border border-[#D6E4F7] bg-[#F7FAFE] px-3 py-3">
            <View className="flex-row items-center">
              <Image
                source={{ uri: selectedImage.uri }}
                className="h-14 w-14 rounded-xl"
                resizeMode="cover"
              />
              <View className="ml-3 flex-1">
                <Text className="text-[14px] text-[#10233F]" numberOfLines={1}>
                  {selectedImage.name}
                </Text>
                <Text className="mt-1 text-[12px] text-[#5B6B82]">
                  Image will be sent with the diagnosis request
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClearImage}
                activeOpacity={0.75}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
              >
                <X size={16} color="#6B7A90" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View className="mb-3 flex-row gap-3">
          <TouchableOpacity
            onPress={onPickImage}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#D6E4F7] bg-[#F7FAFE] py-3"
          >
            <ImagePlus size={18} color={Colors.primary} strokeWidth={2} />
            <Text
              className="ml-2 text-[14px] text-[#10233F]"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              Gallery
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onTakePhoto}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#D6E4F7] bg-[#F7FAFE] py-3"
          >
            <Camera size={18} color={Colors.primary} strokeWidth={2} />
            <Text
              className="ml-2 text-[14px] text-[#10233F]"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
            >
              Camera
            </Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-[28px] border border-[#D6E4F7] bg-[#F7FAFE] px-4 py-3">
          <TextInput
            placeholder="Ask FixIt AI about your problem..."
            placeholderTextColor={themeColors.textMuted}
            value={message}
            onChangeText={onMessageChange}
            multiline
            className="min-h-[76px] text-[15px] text-[#10233F]"
            style={{ fontFamily: "GoogleSans_400Regular", textAlignVertical: "top" }}
          />

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="flex-1 pr-3 text-[12px] text-[#6B7A90]">
              Text can be empty for recommendations with an image.
            </Text>
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <TouchableOpacity
              onPress={onRecommend}
              disabled={!canRecommend || isLoading}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center rounded-full px-4 py-3"
              style={{
                backgroundColor: canRecommend && !isLoading ? Colors.primary : "#B8C7D9",
              }}
            >
              {activeFlow === "recommend" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Sparkles size={16} color="#FFFFFF" strokeWidth={2.3} />
                  <Text
                    className="ml-2 text-[14px] text-white"
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                  >
                    Recommend
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAgent}
              disabled={!canUseAgent || isLoading}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center rounded-full border px-4 py-3"
              style={{
                backgroundColor: canUseAgent && !isLoading ? "#24292F" : "#D5DCE6",
                borderColor: canUseAgent && !isLoading ? "#57606A" : "#C5CEDB",
              }}
            >
              {activeFlow === "agent" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Bot
                    size={16}
                    color={canUseAgent && !isLoading ? "#FFFFFF" : "#7A8698"}
                    strokeWidth={2.3}
                  />
                  <Text
                    className={`ml-2 text-[14px] ${canUseAgent && !isLoading ? "text-white" : "text-[#7A8698]"}`}
                    style={{ fontFamily: "GoogleSans_600SemiBold" }}
                  >
                    Agent
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
