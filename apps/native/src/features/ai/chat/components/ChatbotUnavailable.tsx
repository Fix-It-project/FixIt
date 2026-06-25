import { MessageCircleOff } from "lucide-react-native";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import {
	CHATBOT_UNAVAILABLE_SUBTITLE,
	CHATBOT_UNAVAILABLE_TITLE,
} from "../constants";

/**
 * Kill-switch wrapper for the chatbot. Renders the real chat UI (passed as
 * children) behind a frosted scrim so it stays visible but reads as disabled,
 * and overlays an "unavailable" message. Nothing is interactive — every layer
 * is pointer-transparent so taps hit nothing.
 *
 * Used by the chat route while CHATBOT_ENABLED is false; flip that flag to drop
 * this wrapper and restore the live chatbot.
 */
export function ChatbotUnavailable({ children }: { children: ReactNode }) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-1">
			{/* Real UI, visible but frozen — no touches reach it. */}
			<View className="flex-1" pointerEvents="none">
				{children}
			</View>

			{/* Frosted scrim dims the UI so it reads as disabled. */}
			<View
				pointerEvents="none"
				style={[
					StyleSheet.absoluteFill,
					{ backgroundColor: themeColors.surfaceBase, opacity: 0.6 },
				]}
			/>

			{/* Centered message — above the scrim, also non-interactive. */}
			<View
				className="absolute inset-0 items-center justify-center px-screen-x"
				pointerEvents="none"
			>
				<View
					className="mb-stack-lg h-avatar-xl w-avatar-xl items-center justify-center rounded-pill"
					style={{ backgroundColor: themeColors.primaryLight }}
				>
					<MessageCircleOff
						size={28}
						color={themeColors.primary}
						strokeWidth={1.8}
					/>
				</View>
				<Text variant="h3" className="text-center font-bold text-content">
					{CHATBOT_UNAVAILABLE_TITLE}
				</Text>
				<Text
					variant="bodySm"
					className="mt-stack-sm text-center text-content-muted"
				>
					{CHATBOT_UNAVAILABLE_SUBTITLE}
				</Text>
			</View>
		</View>
	);
}
