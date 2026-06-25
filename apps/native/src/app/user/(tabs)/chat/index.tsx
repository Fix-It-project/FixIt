import { View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { useBottomTabMetrics } from "@/src/components/layout/tab-bar";
import { useThemeColors } from "@/src/constants/design-tokens";
import { ChatbotUnavailable } from "@/src/features/ai/chat/components/ChatbotUnavailable";
import ChatComposer from "@/src/features/ai/chat/components/ChatComposer";
import ChatHeader from "@/src/features/ai/chat/components/ChatHeader";
import ChatMessageList from "@/src/features/ai/chat/components/ChatMessageList";
import { CHATBOT_ENABLED } from "@/src/features/ai/chat/constants";
import { useChatbotController } from "@/src/features/ai/chat/hooks/useChatbotController";
import type { ChatFlow } from "@/src/features/ai/chat/types";

// Kill switch: while CHATBOT_ENABLED is false the live chat renders read-only
// behind a frosted "unavailable" scrim. Flip the flag to restore the chatbot.
export default function ChatbotScreen() {
	if (!CHATBOT_ENABLED) {
		return (
			<ChatbotUnavailable>
				<ChatbotScreenContent />
			</ChatbotUnavailable>
		);
	}
	return <ChatbotScreenContent />;
}

function ChatbotScreenContent() {
	const themeColors = useThemeColors();
	const { tabBarHeight } = useBottomTabMetrics();
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
			<KeyboardStickyView
				offset={{ closed: 0, opened: tabBarHeight }}
				style={{ backgroundColor: themeColors.surfaceBase }}
			>
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
					onStartRecording={() => {
						setMessage("");
						void startRecording();
					}}
					onStopRecording={() => void stopRecording()}
					onClearAudio={() => void clearAudio()}
					onCancelRecording={() => void cancelRecording()}
				/>
			</KeyboardStickyView>
		</View>
	);
}
