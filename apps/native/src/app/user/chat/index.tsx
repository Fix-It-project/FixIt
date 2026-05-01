import { View } from "react-native";
import { KeyboardAvoidingView as ControllerKeyboardAvoidingView } from "react-native-keyboard-controller";
import ChatComposer from "@/src/features/ai/chat/components/ChatComposer";
import ChatHeader from "@/src/features/ai/chat/components/ChatHeader";
import ChatMessageList from "@/src/features/ai/chat/components/ChatMessageList";
import { useChatbotController } from "@/src/features/ai/chat/hooks/useChatbotController";

export default function ChatbotScreen() {
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
    pickImage,
    takePhoto,
    handleRecommend,
    handleAgentOrder,
    handleOpenTechnician,
  } = useChatbotController();

  return (
    <ControllerKeyboardAvoidingView behavior="padding" className="flex-1 bg-[#F3F6FB]">
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
          message={message}
          onMessageChange={setMessage}
          selectedImage={selectedImage}
          onClearImage={() => setSelectedImage(null)}
          onPickImage={() => void pickImage()}
          onTakePhoto={() => void takePhoto()}
          onRecommend={() => void handleRecommend()}
          onAgent={() => void handleAgentOrder()}
          canRecommend={canRecommend}
          canUseAgent={canUseAgent}
          isLoading={isLoading}
          activeFlow={activeFlow}
        />
      </View>
    </ControllerKeyboardAvoidingView>
  );
}
