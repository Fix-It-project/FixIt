import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Keyboard } from "react-native";
import Toast from "react-native-toast-message";
import { diagnoseIssue, placeOrderWithAgent } from "@/src/features/ai/api";
import type { ServiceOrder } from "@/src/features/ai/schemas/response.schema";
import { logger } from "@/src/lib/logger";
import { ROUTES } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLocationStore } from "@/src/stores/location-store";
import type { ChatEntry, ChatFlow, SelectedImage } from "../types";
import { createChatEntryId, getErrorMessage } from "../utils";
import { useAudioRecorder } from "./useAudioRecorder";

export function useChatbotController() {
	const router = useRouter();
	const { requestLocationPermission } = useLocationStore();
	const user = useAuthStore((s) => s.user);

	const [message, setMessage] = useState("");
	const [activeFlow, setActiveFlow] = useState<ChatFlow | null>(null);
	const [mode, setMode] = useState<ChatFlow>("recommend");
	const [isOpeningTechnician, setIsOpeningTechnician] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
		null,
	);
	const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);
	const [agentSessionId, setAgentSessionId] = useState<string | null>(() =>
		Crypto.randomUUID(),
	);

	// Audio recorder
	const {
		recorderState,
		recordedAudio,
		recordingDurationMs,
		startRecording,
		stopRecording,
		clearAudio,
		cancelRecording,
	} = useAudioRecorder();

	const trimmedMessage = message.trim();
	const isLoading = activeFlow !== null;
	const hasAudio = recorderState === "recorded" && !!recordedAudio;

	// canRecommend: text OR image OR recorded audio
	const canRecommend = !!trimmedMessage || !!selectedImage?.base64 || hasAudio;
	// canUseAgent: text OR image OR recorded audio
	const canUseAgent =
		(!!trimmedMessage || !!selectedImage?.base64 || hasAudio) &&
		!!agentSessionId;

	const toggleMode = useCallback(() => {
		setMode((prev) => (prev === "recommend" ? "agent" : "recommend"));
	}, []);

	useFocusEffect(
		useCallback(() => {
			setAgentSessionId(Crypto.randomUUID());

			return () => {
				setAgentSessionId(null);
			};
		}, []),
	);

	const pickImage = useCallback(async () => {
		try {
			const permission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				logger.info("ai.chat", "media_library_permission_denied");
				Toast.show({
					type: "info",
					text1: "Permission required",
					text2: "Please allow access to your photo library.",
				});
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				quality: 0.8,
				allowsEditing: false,
				base64: true,
			});

			if (result.canceled || !result.assets[0]?.base64) return;

			const asset = result.assets[0];
			const base64 = asset.base64;
			if (!base64) return;
			setSelectedImage({
				uri: asset.uri,
				base64,
				name: asset.fileName ?? `photo_${Date.now()}.jpg`,
			});
			logger.info("ai.chat", "image_selected", { source: "library" });
		} catch (err) {
			logger.error("ai.chat", "image_picker_failed", err);
			setError(getErrorMessage(err));
		}
	}, []);

	const takePhoto = useCallback(async () => {
		try {
			const permission = await ImagePicker.requestCameraPermissionsAsync();
			if (!permission.granted) {
				logger.info("ai.chat", "camera_permission_denied");
				Toast.show({
					type: "info",
					text1: "Permission required",
					text2: "Please allow camera access.",
				});
				return;
			}

			const result = await ImagePicker.launchCameraAsync({
				quality: 0.8,
				allowsEditing: false,
				base64: true,
			});

			if (result.canceled || !result.assets[0]?.base64) return;

			const asset = result.assets[0];
			const base64 = asset.base64;
			if (!base64) return;
			setSelectedImage({
				uri: asset.uri,
				base64,
				name: asset.fileName ?? `photo_${Date.now()}.jpg`,
			});
			logger.info("ai.chat", "image_selected", { source: "camera" });
		} catch (err) {
			logger.error("ai.chat", "camera_capture_failed", err);
			setError(getErrorMessage(err));
		}
	}, []);

	const handleRecommend = useCallback(async () => {
		setError(null);

		if (hasAudio && trimmedMessage) {
			setError("Use either voice or text, not both.");
			return;
		}

		if (!trimmedMessage && !selectedImage?.base64 && !hasAudio) {
			setError(
				"Add a description, image, or voice message before asking for recommendations.",
			);
			return;
		}

		await requestLocationPermission();
		const { location } = useLocationStore.getState();
		if (!location) {
			setError("Location is required to find nearby technicians.");
			return;
		}

		const promptText = trimmedMessage;
		const promptImage = selectedImage;
		const audioBase64 = recordedAudio?.base64 ?? undefined;
		const userText = promptText || (hasAudio ? "Voice message" : "");

		setChatEntries((entries) => [
			...entries,
			{
				id: createChatEntryId(),
				type: "user",
				text: userText,
				image: promptImage,
				flow: "recommend",
			},
		]);
		Keyboard.dismiss();
		setMessage("");
		setSelectedImage(null);
		await clearAudio();
		setActiveFlow("recommend");

		try {
			logger.info("ai.chat", "recommendation_request_started", {
				hasText: promptText.length > 0,
				hasImage: !!promptImage?.base64,
				hasAudio: !!audioBase64,
				userId: user?.id ?? null,
			});
			const response = await diagnoseIssue({
				text: promptText,
				image: promptImage?.base64,
				audio: audioBase64,
				latitude: location.latitude,
				longitude: location.longitude,
				userId: user?.id ?? null,
			});
			const nextServiceOrder = response.data.service_order ?? null;
			const nextAssistantMessage = response.data.assistant_message ?? null;

			setChatEntries((entries) => [
				...entries,
				...(nextAssistantMessage
					? [
							{
								id: createChatEntryId(),
								type: "assistant" as const,
								text: nextAssistantMessage,
								flow: "recommend" as const,
							},
						]
					: []),
				...(nextServiceOrder
					? [
							{
								id: createChatEntryId(),
								type: "order" as const,
								serviceOrder: nextServiceOrder,
								flow: "recommend" as const,
								promptText,
							},
						]
					: []),
			]);
			logger.info("ai.chat", "recommendation_request_succeeded", {
				hasOrder: !!nextServiceOrder,
				hasAssistantMessage: !!nextAssistantMessage,
			});
		} catch (err: unknown) {
			logger.error("ai.chat", "recommendation_request_failed", err);
			setError(getErrorMessage(err));
		} finally {
			setActiveFlow(null);
		}
	}, [
		requestLocationPermission,
		selectedImage,
		trimmedMessage,
		user?.id,
		hasAudio,
		recordedAudio,
		clearAudio,
	]);

	const handleAgentOrder = useCallback(async () => {
		setError(null);

		if (hasAudio && trimmedMessage) {
			setError("Use either voice or text, not both.");
			return;
		}

		if (!trimmedMessage && !hasAudio && !selectedImage?.base64) {
			setError("Tell the agent what is happening before it starts the order.");
			return;
		}
		if (!agentSessionId) {
			setError("Start a new agent session before sending your message.");
			return;
		}

		await requestLocationPermission();
		const { location } = useLocationStore.getState();
		if (!location) {
			setError("Location is required for the agent to prepare your order.");
			return;
		}

		const promptText = trimmedMessage;
		const promptImage = selectedImage;
		const audioBase64 = recordedAudio?.base64 ?? undefined;
		const userText = promptText || (hasAudio ? "Voice message" : "");

		setChatEntries((entries) => [
			...entries,
			{
				id: createChatEntryId(),
				type: "user",
				text: userText,
				image: promptImage,
				flow: "agent",
			},
		]);
		Keyboard.dismiss();
		setMessage("");
		setSelectedImage(null);
		await clearAudio();
		setActiveFlow("agent");

		try {
			const userId = user?.id ?? null;
			logger.info("ai.chat", "agent_order_request_started", {
				hasText: promptText.length > 0,
				hasImage: !!promptImage?.base64,
				hasAudio: !!audioBase64,
				userId,
			});
			const response = await placeOrderWithAgent({
				session_id: agentSessionId,
				message: [
					promptText,
					"",
					`[User Location: lat=${location.latitude}, lon=${location.longitude}]`,
					`[User ID: ${userId ?? "guest"}]`,
				].join("\n"),
				audioBuffer: audioBase64,
				image: promptImage?.base64,
			});
			const nextServiceOrder = response.data.service_order ?? null;
			const nextAssistantMessage = response.data.assistant_message ?? null;

			setChatEntries((entries) => [
				...entries,
				...(nextAssistantMessage
					? [
							{
								id: createChatEntryId(),
								type: "assistant" as const,
								text: nextAssistantMessage,
								flow: "agent" as const,
							},
						]
					: []),
				...(nextServiceOrder
					? [
							{
								id: createChatEntryId(),
								type: "order" as const,
								serviceOrder: nextServiceOrder,
								flow: "agent" as const,
								promptText,
							},
						]
					: []),
			]);
			logger.info("ai.chat", "agent_order_request_succeeded", {
				hasOrder: !!nextServiceOrder,
				hasAssistantMessage: !!nextAssistantMessage,
			});
		} catch (err: unknown) {
			logger.error("ai.chat", "agent_order_request_failed", err);
			setError(getErrorMessage(err));
		} finally {
			setActiveFlow(null);
		}
	}, [
		agentSessionId,
		requestLocationPermission,
		trimmedMessage,
		user?.id,
		hasAudio,
		selectedImage,
		recordedAudio,
		clearAudio,
	]);

	const handleOpenTechnician = useCallback(
		async (
			technician: { id: string | number; name: string },
			_order: ServiceOrder,
			_promptText: string,
		) => {
			setIsOpeningTechnician(true);
			try {
				const route = ROUTES.user.technicianDetail(String(technician.id));
				router.push({
					...route,
					params: {
						...route.params,
						technicianName: technician.name,
					},
				});
			} finally {
				setIsOpeningTechnician(false);
			}
		},
		[router],
	);

	const activeOrderCount = useMemo(
		() => chatEntries.filter((entry) => entry.type === "order").length,
		[chatEntries],
	);

	return {
		message,
		setMessage,
		selectedImage,
		setSelectedImage,
		chatEntries,
		error,
		isLoading,
		activeFlow,
		mode,
		toggleMode,
		canRecommend,
		canUseAgent,
		isOpeningTechnician,
		activeOrderCount,
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
	};
}
