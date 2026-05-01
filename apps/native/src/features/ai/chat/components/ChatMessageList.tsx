import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ArrowRight, Bot, Sparkles, Star } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";
import type { ServiceOrder } from "../../schemas/response.schema";
import type { ChatEntry, ChatFlow } from "../types";
import { getRecommendationCards } from "../utils";

type Props = {
  chatEntries: ChatEntry[];
  isLoading: boolean;
  error: string | null;
  activeFlow: ChatFlow | null;
  isOpeningTechnician: boolean;
  onOpenTechnician: (
    technician: { id: string | number; name: string },
    order: ServiceOrder,
    promptText: string,
  ) => void;
};

export default function ChatMessageList({
  chatEntries,
  isLoading,
  error,
  activeFlow,
  isOpeningTechnician,
  onOpenTechnician,
}: Props) {
  return (
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
          Tell me what is happening at home and I&apos;ll suggest the most suitable technician nearby.
        </Text>
      </View>

      {chatEntries.map((entry) => {
        if (entry.type === "user") {
          return (
            <View
              key={entry.id}
              className="mt-4 max-w-[88%] self-end rounded-[24px] rounded-tr-md bg-[#1565D8] px-4 py-4"
            >
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
            <View
              key={entry.id}
              className="mt-4 max-w-[88%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm"
            >
              <View className="mb-2 flex-row items-center">
                <View
                  className={`h-7 w-7 items-center justify-center rounded-full ${entry.flow === "agent" ? "bg-[#24292F]" : "bg-[#E8F1FF]"}`}
                >
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
              <Text className="text-[15px] leading-6 text-[#10233F]">{entry.text}</Text>
            </View>
          );
        }

        const cards = getRecommendationCards(entry.serviceOrder);
        return (
          <View
            key={entry.id}
            className="mt-4 max-w-[92%] self-start rounded-[24px] rounded-tl-md bg-white px-4 py-4 shadow-sm"
          >
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

            <Text className="mt-4 text-[13px] text-[#5B6B82]">Recommended technicians</Text>
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
                    onPress={() =>
                      void onOpenTechnician(
                        { id: technician.id, name: technician.name },
                        entry.serviceOrder,
                        entry.promptText,
                      )
                    }
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

                        <Text
                          className={`mt-2 text-[13px] ${isTopPick ? "text-[#D9E7FF]" : "text-[#5B6B82]"}`}
                        >
                          {distanceLabel} · {scorePercent}
                        </Text>

                        {rateLabel ? (
                          <Text
                            className={`mt-1 text-[13px] ${isTopPick ? "text-[#D9E7FF]" : "text-[#5B6B82]"}`}
                          >
                            {rateLabel}
                          </Text>
                        ) : null}

                        <Text
                          className={`mt-2 text-[13px] ${isTopPick ? "text-white" : "text-[#1565D8]"}`}
                        >
                          Continue to booking
                        </Text>
                      </View>

                      {isOpeningTechnician ? (
                        <ActivityIndicator
                          size="small"
                          color={isTopPick ? "#FFFFFF" : Colors.primary}
                        />
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
    </ScrollView>
  );
}
