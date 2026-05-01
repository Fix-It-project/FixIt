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
import { useColorScheme } from "@/src/hooks/use-color-scheme";
import type { ChatFlow, SelectedImage } from "../types";
import type { AudioRecorderState, RecordedAudio } from "../hooks/useAudioRecorder";

type Props = {
  mode: ChatFlow;
  onToggleMode: () => void;
  message: string;
  onMessageChange: (value: string) => void;
  selectedImage: SelectedImage | null;
  onClearImage: () => void;
  onPickImage: () => void;
  onTakePhoto: () => void;
  onSend: () => void;
  canSend: boolean;
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
  mode,
  onToggleMode,
  message,
  onMessageChange,
  selectedImage,
  onClearImage,
  onPickImage,
  onTakePhoto,
  onSend,
  canSend,
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
  const { isDarkColorScheme } = useColorScheme();

  const isRecording = recorderState === "recording";
  const hasAudio = recorderState === "recorded" && !!recordedAudio;
  const disableTyping = isRecording || hasAudio;

  const containerBg = themeColors.surfaceBase;
  const borderColor = themeColors.borderDefault;
  const inputBg = themeColors.surfaceElevated;
  const mutedText = themeColors.textMuted;
  const bodyText = themeColors.textPrimary;

  const danger = themeColors.danger;
  const dangerSoft = themeColors.dangerSoft;
  const overlayMd = themeColors.overlayMd;
  const overlaySm = themeColors.overlaySm;
  const micIdleBg = themeColors.surfaceElevated;
  const micRecordedBg = themeColors.surfaceMuted;
  const micIcon = themeColors.primary;
  const primary = themeColors.primary;

  return (
    <View
      className="border-t border-black/5 px-4 pt-4"
      style={{ paddingBottom: insets.bottom + 12, backgroundColor: containerBg }}
    >
      {/* Selected image preview */}
      {selectedImage ? (
        <View className="mb-3 rounded-2xl border px-3 py-3" style={{ borderColor }}>
          <View className="flex-row items-center">
            <Image
              source={{ uri: selectedImage.uri }}
              className="h-14 w-14 rounded-xl"
              resizeMode="cover"
            />
            <View className="ml-3 flex-1">
              <Text className="text-[14px]" style={{ color: bodyText }} numberOfLines={1}>
                {selectedImage.name}
              </Text>
              <Text className="mt-1 text-[12px]" style={{ color: mutedText }}>
                Image will be sent with the diagnosis request
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClearImage}
              activeOpacity={0.75}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.overlaySm }}
            >
              <X size={16} color={themeColors.textSecondary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Recorded audio preview */}
      {hasAudio ? (
        <View className="mb-3 rounded-2xl border px-3 py-3" style={{ borderColor }}>
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: primary }}>
              <Mic size={18} color={themeColors.onPrimaryHeader} strokeWidth={2} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-[14px]" style={{ color: bodyText }}>
                Voice message · {formatDuration(recordingDurationMs)}
              </Text>
              <Text className="mt-1 text-[12px]" style={{ color: mutedText }}>
                Voice replaces text input
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClearAudio}
              activeOpacity={0.75}
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.overlaySm }}
            >
              <X size={16} color={themeColors.textSecondary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Recording in-progress indicator */}
      {isRecording ? (
        <View className="mb-3 rounded-2xl border px-3 py-3" style={{ borderColor: dangerSoft }}>
          <View className="flex-row items-center">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: danger }} />
            <Text
              className="ml-2 flex-1 text-[14px]"
              style={{ color: danger, fontFamily: "GoogleSans_600SemiBold" }}
            >
              Recording · {formatDuration(recordingDurationMs)}
            </Text>
            <TouchableOpacity
              onPress={onCancelRecording}
              activeOpacity={0.75}
              className="flex-row items-center rounded-full border px-3 py-1.5"
              style={{ borderColor: dangerSoft, backgroundColor: overlaySm }}
            >
              <MicOff size={13} color={danger} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Mode toggle */}
      <View className="mb-3">
        <TouchableOpacity
          onPress={onToggleMode}
          activeOpacity={0.8}
          className="flex-row items-center justify-center rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: inputBg,
            borderColor,
          }}
        >
          <Text
            className="text-[14px]"
            style={{ color: bodyText, fontFamily: "GoogleSans_600SemiBold" }}
          >
            Mode: {mode === "recommend" ? "Recommend" : "Agent"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Media buttons */}
      <View className="mb-3 flex-row gap-3">
        <TouchableOpacity
          onPress={onPickImage}
          activeOpacity={0.8}
          disabled={isRecording}
          className="flex-1 flex-row items-center justify-center rounded-2xl border py-3"
          style={{
            backgroundColor: inputBg,
            borderColor,
            opacity: isRecording ? 0.5 : 1,
          }}
        >
          <ImagePlus size={18} color={Colors.primary} strokeWidth={2} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="ml-2 text-[13px]"
            style={{ color: bodyText, fontFamily: "GoogleSans_600SemiBold" }}
          >
            Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTakePhoto}
          activeOpacity={0.8}
          disabled={isRecording}
          className="flex-1 flex-row items-center justify-center rounded-2xl border py-3"
          style={{
            backgroundColor: inputBg,
            borderColor,
            opacity: isRecording ? 0.5 : 1,
          }}
        >
          <Camera size={18} color={Colors.primary} strokeWidth={2} />
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="ml-2 text-[13px]"
            style={{ color: bodyText, fontFamily: "GoogleSans_600SemiBold" }}
          >
            Camera
          </Text>
        </TouchableOpacity>
      </View>

      {/* Text input + action row */}
      <View
        className="rounded-[28px] border px-4 py-3"
        style={{ backgroundColor: inputBg, borderColor }}
      >
        <TextInput
          placeholder={hasAudio ? "Voice message attached" : "Ask FixIt AI about your problem..."}
          placeholderTextColor={mutedText}
          value={message}
          onChangeText={onMessageChange}
          multiline
          editable={!disableTyping}
          className="min-h-[76px] text-[15px]"
          style={{
            fontFamily: "GoogleSans_400Regular",
            textAlignVertical: "top",
            color: bodyText,
            opacity: disableTyping ? 0.4 : 1,
          }}
        />

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="flex-1 pr-3 text-[12px]" style={{ color: mutedText }}>
            {hasAudio
              ? "Voice message will be sent instead of text."
              : "Text can be empty for recommendations with an image or voice."}
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
                ? danger
                : hasAudio
                  ? micRecordedBg
                  : micIdleBg,
            }}
          >
            {isRecording ? (
              <View className="h-4 w-4 rounded-sm" style={{ backgroundColor: themeColors.onPrimaryHeader }} />
            ) : (
              <Mic size={18} color={hasAudio ? themeColors.onPrimaryHeader : micIcon} strokeWidth={2.2} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSend}
            disabled={!canSend || isLoading || isRecording}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center rounded-full px-4 py-3"
            style={{
              backgroundColor: canSend && !isLoading && !isRecording ? primary : themeColors.disabledText,
            }}
          >
            {activeFlow === mode ? (
              <ActivityIndicator size="small" color={themeColors.onPrimaryHeader} />
            ) : (
              <Text className="text-[14px]" style={{ color: themeColors.onPrimaryHeader, fontFamily: "GoogleSans_600SemiBold" }}>
                {mode === "recommend" ? "Recommend" : "Agent"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}