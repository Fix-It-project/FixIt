import {
  ActivityIndicator,
  Image,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { Bot, Camera, ImagePlus, Mic, MicOff, Sparkles, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";
import type { ChatFlow, SelectedImage } from "../types";
import type { AudioRecorderState, RecordedAudio } from "../hooks/useAudioRecorder";

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
  // Audio props
  recorderState: AudioRecorderState;
  recordedAudio: RecordedAudio | null;
  recordingDurationMs: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onClearAudio: () => void;
  onCancelRecording: () => void;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

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
  recorderState,
  recordedAudio,
  recordingDurationMs,
  onStartRecording,
  onStopRecording,
  onClearAudio,
  onCancelRecording,
}: Props) {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();

  const isRecording = recorderState === "recording";
  const hasAudio = recorderState === "recorded" && !!recordedAudio;

  return (
    <KeyboardAvoidingView behavior="height">
      <View
        className="border-t border-black/5 bg-white px-4 pt-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {/* Selected image preview */}
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

        {/* Recorded audio preview */}
        {hasAudio ? (
          <View className="mb-3 rounded-2xl border border-[#D6E4F7] bg-[#F0F7FF] px-3 py-3">
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#1565D8]">
                <Mic size={18} color="#FFFFFF" strokeWidth={2} />
              </View>
              <View className="ml-3 flex-1">
                <Text
                  className="text-[14px] text-[#10233F]"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Voice message
                </Text>
                <Text className="mt-1 text-[12px] text-[#5B6B82]">
                  {formatDuration(recordedAudio.durationMs)} · Will be sent with your request
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClearAudio}
                activeOpacity={0.75}
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
              >
                <X size={16} color="#6B7A90" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Recording in-progress indicator */}
        {isRecording ? (
          <View className="mb-3 rounded-2xl border border-[#FFCDD2] bg-[#FFF5F5] px-3 py-3">
            <View className="flex-row items-center">
              {/* Pulsing dot */}
              <View className="h-3 w-3 rounded-full bg-[#E53935]" />
              <Text
                className="ml-2 flex-1 text-[14px] text-[#9F1D1D]"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
              >
                Recording · {formatDuration(recordingDurationMs)}
              </Text>
              <TouchableOpacity
                onPress={onCancelRecording}
                activeOpacity={0.75}
                className="flex-row items-center rounded-full border border-[#FFCDD2] bg-white px-3 py-1.5"
              >
                <MicOff size={13} color="#9F1D1D" strokeWidth={2.2} />
                <Text className="ml-1.5 text-[12px] text-[#9F1D1D]">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Media picker buttons */}
        <View className="mb-3 flex-row gap-3">
          <TouchableOpacity
            onPress={onPickImage}
            activeOpacity={0.8}
            disabled={isRecording}
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#D6E4F7] bg-[#F7FAFE] py-3"
            style={{ opacity: isRecording ? 0.5 : 1 }}
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
            disabled={isRecording}
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#D6E4F7] bg-[#F7FAFE] py-3"
            style={{ opacity: isRecording ? 0.5 : 1 }}
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

        {/* Text input + action row */}
        <View className="rounded-[28px] border border-[#D6E4F7] bg-[#F7FAFE] px-4 py-3">
          <TextInput
            placeholder="Ask FixIt AI about your problem..."
            placeholderTextColor={themeColors.textMuted}
            value={message}
            onChangeText={onMessageChange}
            multiline
            editable={!isRecording}
            className="min-h-[76px] text-[15px] text-[#10233F]"
            style={{
              fontFamily: "GoogleSans_400Regular",
              textAlignVertical: "top",
              opacity: isRecording ? 0.4 : 1,
            }}
          />

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="flex-1 pr-3 text-[12px] text-[#6B7A90]">
              Text can be empty for recommendations with an image or voice.
            </Text>
          </View>

          {/* Action buttons */}
          <View className="mt-3 flex-row items-center gap-2">
            {/* Mic button */}
            <TouchableOpacity
              onPress={isRecording ? onStopRecording : onStartRecording}
              disabled={isLoading || hasAudio}
              activeOpacity={0.85}
              className="h-12 w-12 items-center justify-center rounded-full"
              style={{
                backgroundColor: isRecording
                  ? "#E53935"
                  : hasAudio
                    ? "#B8C7D9"
                    : "#EDF2FA",
              }}
            >
              {isRecording ? (
                // Stop icon (square) when recording
                <View className="h-4 w-4 rounded-sm bg-white" />
              ) : (
                <Mic
                  size={18}
                  color={hasAudio ? "#FFFFFF" : "#1565D8"}
                  strokeWidth={2.2}
                />
              )}
            </TouchableOpacity>

            {/* Recommend */}
            <TouchableOpacity
              onPress={onRecommend}
              disabled={!canRecommend || isLoading || isRecording}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center rounded-full px-4 py-3"
              style={{
                backgroundColor:
                  canRecommend && !isLoading && !isRecording
                    ? Colors.primary
                    : "#B8C7D9",
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

            {/* Agent */}
            <TouchableOpacity
              onPress={onAgent}
              disabled={!canUseAgent || isLoading || isRecording}
              activeOpacity={0.85}
              className="flex-1 flex-row items-center justify-center rounded-full border px-4 py-3"
              style={{
                backgroundColor:
                  canUseAgent && !isLoading && !isRecording ? "#24292F" : "#D5DCE6",
                borderColor:
                  canUseAgent && !isLoading && !isRecording ? "#57606A" : "#C5CEDB",
              }}
            >
              {activeFlow === "agent" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Bot
                    size={16}
                    color={canUseAgent && !isLoading && !isRecording ? "#FFFFFF" : "#7A8698"}
                    strokeWidth={2.3}
                  />
                  <Text
                    className={`ml-2 text-[14px] ${
                      canUseAgent && !isLoading && !isRecording ? "text-white" : "text-[#7A8698]"
                    }`}
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