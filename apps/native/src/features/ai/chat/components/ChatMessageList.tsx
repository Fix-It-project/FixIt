import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { ArrowRight, Bot, Sparkles, Star } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/constants/design-tokens";
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
  const themeColors = useThemeColors();

  const surface = themeColors.surfaceBase;
  const surfaceText = themeColors.textPrimary;
  const mutedText = themeColors.textMuted;
  const cardBg = themeColors.surfaceElevated;
  const assistantBubble = themeColors.surfaceElevated;
  const assistantBorder = themeColors.borderDefault;
  const userBubble = themeColors.roleTech;
  const userBubbleText = themeColors.onPrimaryHeader;
  const assistantBadge = themeColors.primaryLight;
  const agentBadge = themeColors.surfaceMuted;
  const orderCard = themeColors.orderBg;
  const orderText = themeColors.orderText;

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 py-5"
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
    >
      <View
        className="max-w-[88%] self-start rounded-[24px] rounded-tl-md px-4 py-4 shadow-sm"
        style={{ backgroundColor: assistantBubble, borderWidth: 1, borderColor: assistantBorder }}
      >
        <View className="mb-2 flex-row items-center">
          <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: assistantBadge }}>
            <Sparkles size={14} color={themeColors.primary} strokeWidth={2.2} />
          </View>
          <Text variant="bodySm" className="ml-2" style={{ color: mutedText }}>
            FixIt Assistant
          </Text>
        </View>
        <Text variant="body" style={{ color: surfaceText }}>
          Tell me what is happening at home and I&apos;ll suggest the most suitable technician nearby.
        </Text>
      </View>

      {chatEntries.map((entry) => {
        if (entry.type === "user") {
          if (!entry.text && !entry.image) return null;

          return (
            <View
              key={entry.id}
              className="mt-4 max-w-[88%] self-end rounded-[24px] rounded-tr-md px-4 py-4"
              style={{ backgroundColor: userBubble }}
            >
              {entry.text ? (
                <Text variant="body" style={{ color: userBubbleText }}>
                  {entry.text}
                </Text>
              ) : null}
              {entry.image ? (
                <View className={entry.text ? "mt-3" : ""}>
                  <Image
                    source={{ uri: entry.image.uri }}
                    className="h-40 w-[220px] rounded-2xl"
                    resizeMode="cover"
                  />
                  <Text variant="caption" className="mt-2" style={{ color: userBubbleText }} numberOfLines={1}>
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
              className="mt-4 max-w-[88%] self-start rounded-[24px] rounded-tl-md px-4 py-4 shadow-sm"
              style={{ backgroundColor: assistantBubble, borderWidth: 1, borderColor: assistantBorder }}
            >
              <View className="mb-2 flex-row items-center">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
                  style={{ backgroundColor: entry.flow === "agent" ? agentBadge : assistantBadge }}
                >
                  {entry.flow === "agent" ? (
                    <Bot size={14} color={themeColors.onPrimaryHeader} strokeWidth={2.2} />
                  ) : (
                    <Sparkles size={14} color={themeColors.primary} strokeWidth={2.2} />
                  )}
                </View>
                <Text variant="bodySm" className="ml-2" style={{ color: mutedText }}>
                  {entry.flow === "agent" ? "FixIt Agent" : "FixIt Assistant"}
                </Text>
              </View>
              <Text variant="body" style={{ color: surfaceText }}>
                {entry.text}
              </Text>
            </View>
          );
        }

        const cards = getRecommendationCards(entry.serviceOrder);
        return (
          <View
            key={entry.id}
            className="mt-4 max-w-[92%] self-start rounded-[24px] rounded-tl-md px-4 py-4 shadow-sm"
            style={{ backgroundColor: assistantBubble, borderWidth: 1, borderColor: assistantBorder }}
          >
            <View className="mb-3 flex-row items-center">
              <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: assistantBadge }}>
                <Sparkles size={15} color={themeColors.primary} strokeWidth={2.2} />
              </View>
              <Text variant="body" className="ml-2 font-google-sans-semibold" style={{ color: surfaceText }}>
                {entry.flow === "agent" ? "Agent order draft" : "Recommendation ready"}
              </Text>
            </View>

            <Text variant="bodySm" style={{ color: mutedText }}>
              Diagnosed category
            </Text>
            <Text variant="body" className="mt-1 font-google-sans-bold" style={{ color: surfaceText }}>
              {entry.serviceOrder.diagnosed_category}
            </Text>

            <Text variant="bodySm" className="mt-4" style={{ color: mutedText }}>
              Summary
            </Text>
            <Text variant="body" className="mt-1" style={{ color: surfaceText }}>
              {entry.serviceOrder.problem_summary}
            </Text>

            <View className="mt-4 rounded-2xl px-4 py-4" style={{ backgroundColor: cardBg }}>
              <Text variant="bodySm" style={{ color: mutedText }}>
                Estimated cost
              </Text>
              <Text variant="body" className="mt-1 font-google-sans-semibold" style={{ color: surfaceText }}>
                {entry.serviceOrder.estimated_cost_range_egp ?? "N/A"}
              </Text>
            </View>

            <Text variant="bodySm" className="mt-4" style={{ color: mutedText }}>
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
                    onPress={() =>
                      void onOpenTechnician(
                        { id: technician.id, name: technician.name },
                        entry.serviceOrder,
                        entry.promptText,
                      )
                    }
                    activeOpacity={0.85}
                    disabled={isOpeningTechnician}
                    className="rounded-2xl px-4 py-4"
                    style={{ backgroundColor: isTopPick ? themeColors.primary : orderCard }}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center">
                          {isTopPick ? (
                            <View className="mr-2 flex-row items-center rounded-full px-2 py-1" style={{ backgroundColor: themeColors.overlayMd }}>
                              <Star size={12} color={themeColors.onPrimaryHeader} strokeWidth={2.4} fill={themeColors.onPrimaryHeader} />
                              <Text variant="caption" className="ml-1" style={{ color: themeColors.onPrimaryHeader }}>
                                Top pick
                              </Text>
                            </View>
                          ) : null}
                          <Text
                            variant="body"
                            className="font-google-sans-bold"
                            style={{ color: isTopPick ? themeColors.onPrimaryHeader : surfaceText }}
                          >
                            {technician.name}
                          </Text>
                        </View>

                        <Text variant="bodySm" className="mt-2" style={{ color: isTopPick ? themeColors.onPrimaryHeader : mutedText }}>
                          {distanceLabel} · {scorePercent}
                        </Text>

                        {rateLabel ? (
                          <Text variant="bodySm" className="mt-1" style={{ color: isTopPick ? themeColors.onPrimaryHeader : mutedText }}>
                            {rateLabel}
                          </Text>
                        ) : null}

                        <Text variant="bodySm" className="mt-2" style={{ color: isTopPick ? themeColors.onPrimaryHeader : themeColors.primary }}>
                          Continue to booking
                        </Text>
                      </View>

                      {isOpeningTechnician ? (
                        <ActivityIndicator size="small" color={isTopPick ? themeColors.onPrimaryHeader : themeColors.primary} />
                      ) : (
                        <ArrowRight size={20} color={isTopPick ? themeColors.onPrimaryHeader : themeColors.primary} strokeWidth={2.4} />
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
        <View className="mt-4 max-w-[82%] self-start rounded-[24px] rounded-tl-md px-4 py-4" style={{ backgroundColor: surface }}>
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text variant="bodySm" className="ml-3" style={{ color: mutedText }}>
              {activeFlow === "agent"
                ? "Agent is preparing your order..."
                : "Finding technician recommendations..."}
            </Text>
          </View>
        </View>
      ) : null}

      {error ? (
        <View className="mt-4 max-w-[88%] self-start rounded-[24px] rounded-tl-md px-4 py-4" style={{ backgroundColor: themeColors.dangerLight }}>
          <Text variant="bodySm" style={{ color: themeColors.danger }}>
            {error}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
