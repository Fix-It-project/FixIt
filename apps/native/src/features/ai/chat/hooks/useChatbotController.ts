import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Keyboard } from "react-native";
import { diagnoseIssue, placeOrderWithAgent } from "@/src/features/ai/api";
import type { ServiceOrder } from "@/src/features/ai/schemas/response.schema";
import { getServicesByCategory } from "@/src/features/services/api/services";
import { ROUTES } from "@/src/lib/routes";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLocationStore } from "@/src/stores/location-store";
import type { ChatEntry, ChatFlow, SelectedImage } from "../types";
import {
  createChatEntryId,
  findCategoryByDiagnosis,
  getErrorMessage,
  scoreServiceMatch,
} from "../utils";

export function useChatbotController() {
  const router = useRouter();
  const { requestLocationPermission } = useLocationStore();
  const user = useAuthStore((s) => s.user);

  const [message, setMessage] = useState("");
  const [activeFlow, setActiveFlow] = useState<ChatFlow | null>(null);
  const [isOpeningTechnician, setIsOpeningTechnician] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [chatEntries, setChatEntries] = useState<ChatEntry[]>([]);
  const [agentSessionId, setAgentSessionId] = useState<string | null>(() =>
    Crypto.randomUUID(),
  );

  const trimmedMessage = message.trim();
  const isLoading = activeFlow !== null;
  const canRecommend = !!trimmedMessage || !!selectedImage?.base64;
  const canUseAgent = !!trimmedMessage && !!agentSessionId;

  useFocusEffect(
    useCallback(() => {
      setAgentSessionId(Crypto.randomUUID());

      return () => {
        setAgentSessionId(null);
      };
    }, []),
  );

  const pickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
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
  }, []);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow camera access.");
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
  }, []);

  const handleRecommend = useCallback(async () => {
    setError(null);

    if (!trimmedMessage && !selectedImage?.base64) {
      setError("Add a description or image before asking for recommendations.");
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
    setChatEntries((entries) => [
      ...entries,
      {
        id: createChatEntryId(),
        type: "user",
        text: promptText,
        image: promptImage,
        flow: "recommend",
      },
    ]);
    Keyboard.dismiss();
    setMessage("");
    setSelectedImage(null);
    setActiveFlow("recommend");

    try {
      const response = await diagnoseIssue({
        text: promptText,
        image: promptImage?.base64,
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
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "Failed to recommend technicians. Please try again.");
    } finally {
      setActiveFlow(null);
    }
  }, [requestLocationPermission, selectedImage, trimmedMessage, user?.id]);

  const handleAgentOrder = useCallback(async () => {
    setError(null);

    if (!trimmedMessage) {
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
    setChatEntries((entries) => [
      ...entries,
      {
        id: createChatEntryId(),
        type: "user",
        text: promptText,
        image: null,
        flow: "agent",
      },
    ]);
    Keyboard.dismiss();
    setMessage("");
    setSelectedImage(null);
    setActiveFlow("agent");

    try {
      const userId = user?.id ?? null;
      const response = await placeOrderWithAgent({
        session_id: agentSessionId,
        message: [
          promptText,
          "",
          `[User Location: lat=${location.latitude}, lon=${location.longitude}]`,
          `[User ID: ${userId ?? "guest"}]`,
        ].join("\n"),
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
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "The agent could not prepare the order. Please try again.");
    } finally {
      setActiveFlow(null);
    }
  }, [agentSessionId, requestLocationPermission, trimmedMessage, user?.id]);

  const handleOpenTechnician = useCallback(
    async (technician: { id: string | number; name: string }, order: ServiceOrder, promptText: string) => {
      setError(null);
      setIsOpeningTechnician(true);

      try {
        const matchedCategory = findCategoryByDiagnosis(order.diagnosed_category);
        if (!matchedCategory) {
          setError("Could not match this diagnosis to a booking category.");
          return;
        }

        const servicesResponse = await getServicesByCategory(matchedCategory.id);
        const services = servicesResponse.services;
        if (!services.length) {
          setError("No bookable services were found for this diagnosis.");
          return;
        }

        const rankedServices = [...services].sort((a, b) => {
          const aScore = scoreServiceMatch(a.name, [
            order.problem_summary,
            order.diagnosed_category,
            promptText,
          ]);
          const bScore = scoreServiceMatch(b.name, [
            order.problem_summary,
            order.diagnosed_category,
            promptText,
          ]);
          return bScore - aScore;
        });

        const selectedService = rankedServices[0];
        const route = ROUTES.user.bookingRoot(String(technician.id));
        router.push({
          ...route,
          params: {
            ...route.params,
            technicianName: technician.name,
            categoryId: matchedCategory.id,
            categoryName: matchedCategory.label,
            serviceId: selectedService.id,
            serviceName: selectedService.name,
            category: order.diagnosed_category,
            summary: order.problem_summary,
            estimated_cost: order.estimated_cost_range_egp ?? "",
          },
        });
      } catch (err: unknown) {
        setError(getErrorMessage(err) ?? "Failed to open the technician booking flow.");
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
    canRecommend,
    canUseAgent,
    isOpeningTechnician,
    activeOrderCount,
    pickImage,
    takePhoto,
    handleRecommend,
    handleAgentOrder,
    handleOpenTechnician,
  };
}
