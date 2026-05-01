import { View } from "react-native";
import { KeyboardAvoidingView as ControllerKeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatComposer from "@/src/features/ai/chat/components/ChatComposer";
import ChatHeader from "@/src/features/ai/chat/components/ChatHeader";
import ChatMessageList from "@/src/features/ai/chat/components/ChatMessageList";
import { useChatbotController } from "@/src/features/ai/chat/hooks/useChatbotController";
import { useThemeColors } from "@/src/lib/theme";

export default function ChatbotScreen() {
  const insets = useSafeAreaInsets();
  const themeColors = useThemeColors();
  const {
    message,
    setMessage,
    selectedImage,
    setSelectedImage,
    chatEntries,
    error,
    isLoading,
    activeFlow,
    canRecommend,
    canUseAgent,
    isOpeningTechnician,
    mode,
    toggleMode,
    // Audio
    recorderState,
    recordedAudio,
    recordingDurationMs,
    startRecording,
    stopRecording,
    clearAudio,
    cancelRecording,
    // Handlers
    pickImage,
    takePhoto,
    handleRecommend,
    handleAgentOrder,
    handleOpenTechnician,
  } = useChatbotController();

  const canSend = mode === "recommend" ? canRecommend : canUseAgent;
  const handleSend = mode === "recommend" ? handleRecommend : handleAgentOrder;

  return (
    <ControllerKeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 12}
      className="flex-1"
      style={{ backgroundColor: themeColors.surfaceBase }}
    >
      <View className="flex-1">
        <ChatHeader />
        <ChatMessageList
          chatEntries={chatEntries}
          isLoading={isLoading}
          error={error}
          activeFlow={activeFlow}
          isOpeningTechnician={isOpeningTechnician}
          onOpenTechnician={handleOpenTechnician}
        />
        <ChatComposer
          mode={mode}
          onToggleMode={toggleMode}
          message={message}
          onMessageChange={setMessage}
          selectedImage={selectedImage}
          onClearImage={() => setSelectedImage(null)}
          onPickImage={() => void pickImage()}
          onTakePhoto={() => void takePhoto()}
          onSend={() => void handleSend()}
          canSend={canSend}
          isLoading={isLoading}
          activeFlow={activeFlow}
          // Audio
          recorderState={recorderState}
          recordedAudio={recordedAudio}
          recordingDurationMs={recordingDurationMs}
          onStartRecording={() => {
            setMessage("");
            void startRecording();
          }}
          onStopRecording={() => void stopRecording()}
          onClearAudio={() => void clearAudio()}
          onCancelRecording={() => void cancelRecording()}
        />
      </View>
    </ControllerKeyboardAvoidingView>
  );
}