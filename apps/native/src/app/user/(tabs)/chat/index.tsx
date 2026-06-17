import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { useThemeColors } from "@/src/constants/design-tokens";
import ChatComposer from "@/src/features/ai/chat/components/ChatComposer";
import ChatHeader from "@/src/features/ai/chat/components/ChatHeader";
import ChatMessageList from "@/src/features/ai/chat/components/ChatMessageList";
import { useChatbotController } from "@/src/features/ai/chat/hooks/useChatbotController";
import type { ChatFlow } from "@/src/features/ai/chat/types";

export default function ChatbotScreen() {
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
	// Two modes only — selecting the inactive one is a toggle.
	const selectMode = (next: ChatFlow) => {
		if (next !== mode) toggleMode();
	};

	return (
		<View
			className="flex-1"
			style={{ backgroundColor: themeColors.surfaceBase }}
		>
			<ScreenStatusBar variant="surface" />
			<KeyboardAvoidingView
				behavior="padding"
				keyboardVerticalOffset={0}
				className="flex-1"
				style={{ backgroundColor: themeColors.surfaceBase }}
			>
				<ChatHeader />
				<ChatMessageList
					mode={mode}
					chatEntries={chatEntries}
					isLoading={isLoading}
					error={error}
					activeFlow={activeFlow}
					isOpeningTechnician={isOpeningTechnician}
					onOpenTechnician={handleOpenTechnician}
				/>
				<ChatComposer
					mode={mode}
					onSelectMode={selectMode}
					message={message}
					onMessageChange={setMessage}
					selectedImage={selectedImage}
					onClearImage={() => setSelectedImage(null)}
					onPickImage={() => void pickImage()}
					onTakePhoto={() => void takePhoto()}
					onSend={() => void handleSend()}
					canSend={canSend}
					isLoading={isLoading}
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
			</KeyboardAvoidingView>
		</View>
	);
}
