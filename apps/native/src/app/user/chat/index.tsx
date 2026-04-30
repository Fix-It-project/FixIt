import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import * as Crypto from "expo-crypto";
import { useFocusEffect, useRouter } from "expo-router";
import {
  ArrowRight,
  Bot,
  Camera,
  ImagePlus,
  MessageCircle,
  Sparkles,
  Star,
  X,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView as ControllerKeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/src/components/ui/text";
import { diagnoseIssue, placeOrderWithAgent } from "@/src/features/ai/api";
import type { ServiceOrder } from "@/src/features/ai/schemas/response.schema";
import { getServicesByCategory } from "@/src/features/services/api/services";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { ROUTES } from "@/src/lib/routes";
import { Colors, useThemeColors } from "@/src/lib/theme";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLocationStore } from "@/src/stores/location-store";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      typeof error.response?.data === "string"
        ? error.response.data
        : typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : null;

    if (responseMessage) {
      return responseMessage;
    }
  }

  return error instanceof Error ? error.message : null;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function findCategoryByDiagnosis(categoryName: string) {
  const normalizedDiagnosis = normalizeText(categoryName);

  return CATEGORIES.find((category) => {
    const normalizedLabel = normalizeText(category.label);
    return (
      normalizedLabel === normalizedDiagnosis ||
      normalizedLabel.includes(normalizedDiagnosis) ||
      normalizedDiagnosis.includes(normalizedLabel)
    );
  });
}

function scoreServiceMatch(serviceName: string, contextParts: string[]) {
  const normalizedServiceName = normalizeText(serviceName);
  if (!normalizedServiceName) return 0;

  const serviceTokens = normalizedServiceName.split(" ");
  let score = 0;

  for (const part of contextParts) {
    const normalizedPart = normalizeText(part);
    if (!normalizedPart) continue;

    if (normalizedPart.includes(normalizedServiceName)) {
      score += 10;
    }

    for (const token of serviceTokens) {
      if (token.length > 2 && normalizedPart.includes(token)) {
        score += 1;
      }
    }
  }

  return score;
}

type SelectedImage = {
  uri: string;
  base64: string;
  name: string;
};

type SubmittedPrompt = {
  text: string;
  image: SelectedImage | null;
  flow: "recommend" | "agent";
};

type RecommendationCard = {
  id: string;
  name: string;
  category?: string | null;
  distance_km: number;
  match_score: number;
  trust_score?: number | null;
  hourly_rate_egp?: number | null;
  isAssigned?: boolean;
};

type ChatEntry =
  | {
      id: string;
      type: "user";
      text: string;
      image: SelectedImage | null;
      flow: "recommend" | "agent";
    }
  | {
      id: string;
      type: "assistant";
      text: string;
      flow: "recommend" | "agent";
    }
  | {
      id: string;
      type: "order";
      serviceOrder: ServiceOrder;
      flow: "recommend" | "agent";
      promptText: string;
    };

function createChatEntryId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getRecommendationCards(serviceOrder: ServiceOrder) {
  const assignedId = String(serviceOrder.assigned_technician.id);
  const cards: RecommendationCard[] = [
    {
      id: assignedId,
      name: serviceOrder.assigned_technician.name,
      category: serviceOrder.assigned_technician.category,
      distance_km: serviceOrder.assigned_technician.distance_km,
      match_score: serviceOrder.assigned_technician.match_score,
      trust_score: serviceOrder.assigned_technician.trust_score,
      hourly_rate_egp: serviceOrder.assigned_technician.hourly_rate_egp,
      isAssigned: true,
    },
  ];

  const seen = new Set<string>([assignedId]);
  for (const technician of serviceOrder.all_recommendations ?? []) {
    const technicianId = String(technician.id || "");
    if (!technicianId || seen.has(technicianId)) continue;
    seen.add(technicianId);
    cards.push({
      id: technicianId,
      name: technician.name,
      category: technician.category,
      distance_km: technician.distance_km,
      match_score: technician.match_score,
      trust_score: technician.trust_score,
      hourly_rate_egp: technician.hourly_rate_egp,
    });
    if (cards.length === 3) break;
  }

  return cards;
}

export default function ChatbotScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const { requestLocationPermission } = useLocationStore();
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const [message, setMessage] = useState("");
  const [activeFlow, setActiveFlow] = useState<"recommend" | "agent" | null>(null);
  const [isOpeningTechnician, setIsOpeningTechnician] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState<SubmittedPrompt | null>(null);
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
    setAssistantMessage(null);
    setServiceOrder(null);

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
          ? [{
              id: createChatEntryId(),
              type: "assistant" as const,
              text: nextAssistantMessage,
              flow: "recommend" as const,
            }]
          : []),
        ...(nextServiceOrder
          ? [{
              id: createChatEntryId(),
              type: "order" as const,
              serviceOrder: nextServiceOrder,
              flow: "recommend" as const,
              promptText,
            }]
          : []),
      ]);
      setServiceOrder(null);
      setAssistantMessage(null);
      setSubmittedPrompt(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "Failed to recommend technicians. Please try again.");
    } finally {
      setActiveFlow(null);
    }
  }, [requestLocationPermission, selectedImage, trimmedMessage, user?.id]);

  const handleAgentOrder = useCallback(async () => {
    setError(null);
    setAssistantMessage(null);
    setServiceOrder(null);

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
      console.log("[AI Agent] session_id:", agentSessionId);
      const nextServiceOrder = response.data.service_order ?? null;
      const nextAssistantMessage = response.data.assistant_message ?? null;

      setChatEntries((entries) => [
        ...entries,
        ...(nextAssistantMessage
          ? [{
              id: createChatEntryId(),
              type: "assistant" as const,
              text: nextAssistantMessage,
              flow: "agent" as const,
            }]
          : []),
        ...(nextServiceOrder
          ? [{
              id: createChatEntryId(),
              type: "order" as const,
              serviceOrder: nextServiceOrder,
              flow: "agent" as const,
              promptText,
            }]
          : []),
      ]);
      setServiceOrder(null);
      setAssistantMessage(null);
      setSubmittedPrompt(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "The agent could not prepare the order. Please try again.");
    } finally {
      setActiveFlow(null);
    }
  }, [agentSessionId, requestLocationPermission, trimmedMessage, user?.id]);

  const handleOpenTechnician = useCallback(async (technician: {
    id: string | number;
    name: string;
  }, orderOverride?: ServiceOrder, promptTextOverride?: string) => {
    const activeServiceOrder = orderOverride ?? serviceOrder;
    if (!activeServiceOrder) return;

    setError(null);
    setIsOpeningTechnician(true);

    try {
      const matchedCategory = findCategoryByDiagnosis(activeServiceOrder.diagnosed_category);

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
          activeServiceOrder.problem_summary,
          activeServiceOrder.diagnosed_category,
          promptTextOverride ?? trimmedMessage,
        ]);
        const bScore = scoreServiceMatch(b.name, [
          activeServiceOrder.problem_summary,
          activeServiceOrder.diagnosed_category,
          promptTextOverride ?? trimmedMessage,
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
          category: activeServiceOrder.diagnosed_category,
          summary: activeServiceOrder.problem_summary,
          estimated_cost: activeServiceOrder.estimated_cost_range_egp ?? "",
        },
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err) ?? "Failed to open the technician booking flow.");
    } finally {
      setIsOpeningTechnician(false);
    }
  }, [router, serviceOrder, trimmedMessage]);

  const recommendedTechnicians = useMemo(() => {
    if (!serviceOrder) return [];

    const assignedId = String(serviceOrder.assigned_technician.id);
    const cards: RecommendationCard[] = [
      {
        id: assignedId,
        name: serviceOrder.assigned_technician.name,
        category: serviceOrder.assigned_technician.category,
        distance_km: serviceOrder.assigned_technician.distance_km,
        match_score: serviceOrder.assigned_technician.match_score,
        trust_score: serviceOrder.assigned_technician.trust_score,
        hourly_rate_egp: serviceOrder.assigned_technician.hourly_rate_egp,
        isAssigned: true,
      },
    ];

    const seen = new Set<string>([assignedId]);
    for (const technician of serviceOrder.all_recommendations ?? []) {
      const technicianId = String(technician.id || "");
      if (!technicianId || seen.has(technicianId)) continue;
      seen.add(technicianId);
      cards.push({
        id: technicianId,
        name: technician.name,
        category: technician.category,
        distance_km: technician.distance_km,
        match_score: technician.match_score,
        trust_score: technician.trust_score,
        hourly_rate_egp: technician.hourly_rate_egp,
      });
      if (cards.length === 3) break;
    }

    return cards;
  }, [serviceOrder]);

  return (
    <ControllerKeyboardAvoidingView behavior="padding" className="flex-1 bg-[#F3F6FB]">
      <View className="border-b border-black/5 bg-white px-5 pb-4 pt-6">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#E8F1FF]">
            <MessageCircle size={20} color={Colors.primary} strokeWidth={2} />
          </View>
          <View className="ml-3 flex-1">
            <Text
              className="text-[18px] text-[#10233F]"
              style={{ fontFamily: "GoogleSans_700Bold" }}
            >
              AI Assistant
            </Text>
            <Text className="mt-1 text-[13px] text-[#5B6B82]">
              Describe the issue or send a photo to get a technician recommendation.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-5"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      >
        <View className="max-w-[88%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm">
          <View className="mb-2 flex-row items-center">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-[#E8F1FF]">
              <Sparkles size={14} color={Colors.primary} strokeWidth={2.2} />
            </View>
            <Text className="ml-2 text-[13px] text-[#48607D]">FixIt Assistant</Text>
          </View>
          <Text className="text-[15px] leading-6 text-[#10233F]">
            Tell me what is happening at home and I’ll suggest the most suitable technician nearby.
          </Text>
        </View>

        {chatEntries.map((entry) => {
          if (entry.type === "user") {
            return (
              <View key={entry.id} className="mt-4 max-w-[88%] self-end rounded-[24px] rounded-tr-md bg-[#1565D8] px-4 py-4">
                {entry.text ? (
                  <Text className="text-[15px] leading-6 text-white">{entry.text}</Text>
                ) : null}

                {entry.image ? (
                  <View className={entry.text ? "mt-3" : ""}>
                    <Image
                      source={{ uri: entry.image.uri }}
                      className="h-40 w-[220px] rounded-2xl"
                      resizeMode="cover"
                    />
                    <Text className="mt-2 text-[12px] text-[#D9E7FF]" numberOfLines={1}>
                      {entry.image.name}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          }

          if (entry.type === "assistant") {
            return (
              <View key={entry.id} className="mt-4 max-w-[88%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm">
                <View className="mb-2 flex-row items-center">
                  <View className={`h-7 w-7 items-center justify-center rounded-full ${entry.flow === "agent" ? "bg-[#24292F]" : "bg-[#E8F1FF]"}`}>
                    {entry.flow === "agent" ? (
                      <Bot size={14} color="#FFFFFF" strokeWidth={2.2} />
                    ) : (
                      <Sparkles size={14} color={Colors.primary} strokeWidth={2.2} />
                    )}
                  </View>
                  <Text className="ml-2 text-[13px] text-[#48607D]">
                    {entry.flow === "agent" ? "FixIt Agent" : "FixIt Assistant"}
                  </Text>
                </View>
                <Text className="text-[15px] leading-6 text-[#10233F]">
                  {entry.text}
                </Text>
              </View>
            );
          }

          const cards = getRecommendationCards(entry.serviceOrder);

          return (
            <View key={entry.id} className="mt-4 max-w-[92%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm">
              <View className="mb-3 flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E8F1FF]">
                  <Sparkles size={15} color={Colors.primary} strokeWidth={2.2} />
                </View>
                <Text
                  className="ml-2 text-[15px] text-[#10233F]"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  {entry.flow === "agent" ? "Agent order draft" : "Recommendation ready"}
                </Text>
              </View>

              <Text className="text-[13px] text-[#5B6B82]">Diagnosed category</Text>
              <Text
                className="mt-1 text-[17px] text-[#10233F]"
                style={{ fontFamily: "GoogleSans_700Bold" }}
              >
                {entry.serviceOrder.diagnosed_category}
              </Text>

              <Text className="mt-4 text-[13px] text-[#5B6B82]">Summary</Text>
              <Text className="mt-1 text-[15px] leading-6 text-[#1B2B41]">
                {entry.serviceOrder.problem_summary}
              </Text>

              <View className="mt-4 rounded-2xl bg-[#F5F8FD] px-4 py-4">
                <Text className="text-[13px] text-[#5B6B82]">Estimated cost</Text>
                <Text
                  className="mt-1 text-[16px] text-[#10233F]"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  {entry.serviceOrder.estimated_cost_range_egp ?? "N/A"}
                </Text>
              </View>

              <Text className="mt-4 text-[13px] text-[#5B6B82]">
                Recommended technicians
              </Text>
              <View className="mt-2 gap-3">
                {cards.map((technician, index) => {
                  const isTopPick = index === 0 || technician.isAssigned;
                  const distanceLabel = `${technician.distance_km.toFixed(1)} km away`;
                  const scorePercent = `${Math.round(technician.match_score * 100)}% match`;
                  const rateLabel = technician.hourly_rate_egp
                    ? `${technician.hourly_rate_egp} EGP/hr`
                    : null;
                  const recommendationKey = `${String(technician.id || technician.name)}-${entry.id}-${index}`;

                  return (
                    <TouchableOpacity
                      key={recommendationKey}
                      onPress={() => void handleOpenTechnician({
                        id: technician.id,
                        name: technician.name,
                      }, entry.serviceOrder, entry.promptText)}
                      activeOpacity={0.85}
                      disabled={isOpeningTechnician}
                      className={`rounded-2xl px-4 py-4 ${isTopPick ? "bg-[#1565D8]" : "bg-[#F5F8FD]"}`}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-3">
                          <View className="flex-row items-center">
                            {isTopPick ? (
                              <View className="mr-2 flex-row items-center rounded-full bg-white/16 px-2 py-1">
                                <Star size={12} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />
                                <Text className="ml-1 text-[11px] text-white">Top pick</Text>
                              </View>
                            ) : null}
                            <Text
                              className={`text-[16px] ${isTopPick ? "text-white" : "text-[#10233F]"}`}
                              style={{ fontFamily: "GoogleSans_700Bold" }}
                            >
                              {technician.name}
                            </Text>
                          </View>

                          <Text className={`mt-2 text-[13px] ${isTopPick ? "text-[#D9E7FF]" : "text-[#5B6B82]"}`}>
                            {distanceLabel} · {scorePercent}
                          </Text>

                          {rateLabel ? (
                            <Text className={`mt-1 text-[13px] ${isTopPick ? "text-[#D9E7FF]" : "text-[#5B6B82]"}`}>
                              {rateLabel}
                            </Text>
                          ) : null}

                          <Text className={`mt-2 text-[13px] ${isTopPick ? "text-white" : "text-[#1565D8]"}`}>
                            Continue to booking
                          </Text>
                        </View>

                        {isOpeningTechnician ? (
                          <ActivityIndicator size="small" color={isTopPick ? "#FFFFFF" : Colors.primary} />
                        ) : (
                          <ArrowRight
                            size={20}
                            color={isTopPick ? "#FFFFFF" : Colors.primary}
                            strokeWidth={2.4}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        {submittedPrompt ? (
          <View className="mt-4 max-w-[88%] self-end rounded-[24px] rounded-tr-md bg-[#1565D8] px-4 py-4">
            {submittedPrompt.text ? (
              <Text className="text-[15px] leading-6 text-white">{submittedPrompt.text}</Text>
            ) : null}

            {submittedPrompt.image ? (
              <View className={submittedPrompt.text ? "mt-3" : ""}>
                <Image
                  source={{ uri: submittedPrompt.image.uri }}
                  className="h-40 w-[220px] rounded-2xl"
                  resizeMode="cover"
                />
                <Text className="mt-2 text-[12px] text-[#D9E7FF]" numberOfLines={1}>
                  {submittedPrompt.image.name}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {isLoading ? (
          <View className="mt-4 max-w-[82%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4">
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text className="ml-3 text-[14px] text-[#42566F]">
                {activeFlow === "agent"
                  ? "Agent is preparing your order..."
                  : "Finding technician recommendations..."}
              </Text>
            </View>
          </View>
        ) : null}

        {error ? (
          <View className="mt-4 max-w-[88%] self-start rounded-[24px] rounded-tl-md bg-[#FFF1F1] px-4 py-4">
            <Text className="text-[14px] leading-6 text-[#9F1D1D]">{error}</Text>
          </View>
        ) : null}

        {assistantMessage ? (
          <View className="mt-4 max-w-[88%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm">
            <View className="mb-2 flex-row items-center">
              <View className={`h-7 w-7 items-center justify-center rounded-full ${submittedPrompt?.flow === "agent" ? "bg-[#24292F]" : "bg-[#E8F1FF]"}`}>
                {submittedPrompt?.flow === "agent" ? (
                  <Bot size={14} color="#FFFFFF" strokeWidth={2.2} />
                ) : (
                  <Sparkles size={14} color={Colors.primary} strokeWidth={2.2} />
                )}
              </View>
              <Text className="ml-2 text-[13px] text-[#48607D]">
                {submittedPrompt?.flow === "agent" ? "FixIt Agent" : "FixIt Assistant"}
              </Text>
            </View>
            <Text className="text-[15px] leading-6 text-[#10233F]">
              {assistantMessage}
            </Text>
          </View>
        ) : null}

        {serviceOrder ? (
          <View className="mt-4 max-w-[92%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm">
            <View className="mb-3 flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-[#E8F1FF]">
                <Sparkles size={15} color={Colors.primary} strokeWidth={2.2} />
              </View>
              <Text
                className="ml-2 text-[15px] text-[#10233F]"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
              >
                {submittedPrompt?.flow === "agent" ? "Agent order draft" : "Recommendation ready"}
              </Text>
            </View>

            <Text className="text-[13px] text-[#5B6B82]">Diagnosed category</Text>
            <Text
              className="mt-1 text-[17px] text-[#10233F]"
              style={{ fontFamily: "GoogleSans_700Bold" }}
            >
              {serviceOrder.diagnosed_category}
            </Text>

            <Text className="mt-4 text-[13px] text-[#5B6B82]">Summary</Text>
            <Text className="mt-1 text-[15px] leading-6 text-[#1B2B41]">
              {serviceOrder.problem_summary}
            </Text>

            <View className="mt-4 rounded-2xl bg-[#F5F8FD] px-4 py-4">
              <Text className="text-[13px] text-[#5B6B82]">Estimated cost</Text>
              <Text
                className="mt-1 text-[16px] text-[#10233F]"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
              >
                {serviceOrder.estimated_cost_range_egp ?? "N/A"}
              </Text>
            </View>

            <Text className="mt-4 text-[13px] text-[#5B6B82]">
              Recommended technicians
            </Text>
            <View className="mt-2 gap-3">
              {recommendedTechnicians.map((technician, index) => {
                const isTopPick = index === 0 || technician.isAssigned;
                const distanceLabel = `${technician.distance_km.toFixed(1)} km away`;
                const scorePercent = `${Math.round(technician.match_score * 100)}% match`;
                const rateLabel = technician.hourly_rate_egp
                  ? `${technician.hourly_rate_egp} EGP/hr`
                  : null;
                const recommendationKey = `${String(technician.id || technician.name)}-${index}`;

                return (
                  <TouchableOpacity
                    key={recommendationKey}
                    onPress={() => void handleOpenTechnician({
                      id: technician.id,
                      name: technician.name,
                    })}
                    activeOpacity={0.85}
                    disabled={isOpeningTechnician}
                    className={`rounded-2xl px-4 py-4 ${isTopPick ? "bg-[#1565D8]" : "bg-[#F5F8FD]"}`}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center">
                          {isTopPick ? (
                            <View className="mr-2 flex-row items-center rounded-full bg-white/16 px-2 py-1">
                              <Star size={12} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />
                              <Text className="ml-1 text-[11px] text-white">Top pick</Text>
                            </View>
                          ) : null}
                          <Text
                            className={`text-[16px] ${isTopPick ? "text-white" : "text-[#10233F]"}`}
                            style={{ fontFamily: "GoogleSans_700Bold" }}
                          >
                            {technician.name}
                          </Text>
                        </View>

                        <Text className={`mt-2 text-[13px] ${isTopPick ? "text-[#D9E7FF]" : "text-[#5B6B82]"}`}>
                          {distanceLabel} · {scorePercent}
                        </Text>

                        {rateLabel ? (
                          <Text className={`mt-1 text-[13px] ${isTopPick ? "text-[#D9E7FF]" : "text-[#5B6B82]"}`}>
                            {rateLabel}
                          </Text>
                        ) : null}

                        <Text className={`mt-2 text-[13px] ${isTopPick ? "text-white" : "text-[#1565D8]"}`}>
                          Continue to booking
                        </Text>
                      </View>

                      {isOpeningTechnician ? (
                        <ActivityIndicator size="small" color={isTopPick ? "#FFFFFF" : Colors.primary} />
                      ) : (
                        <ArrowRight
                          size={20}
                          color={isTopPick ? "#FFFFFF" : Colors.primary}
                          strokeWidth={2.4}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </ScrollView>

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
                  onPress={() => setSelectedImage(null)}
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
              onPress={() => void pickImage()}
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
              onPress={() => void takePhoto()}
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
              onChangeText={setMessage}
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
                onPress={() => void handleRecommend()}
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
                onPress={() => void handleAgentOrder()}
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
    </ControllerKeyboardAvoidingView>
  );
}
