import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { ClipboardList, type LucideIcon } from "lucide-react-native";
import { useThemeColors } from "@/src/lib/theme";
import type { ThemePalette } from "@/src/lib/theme";
import Animated, { FadeInRight } from "react-native-reanimated";
import {
  usePendingOrders,
  useAcceptOrderMutation,
  useRejectOrderMutation,
} from "@/src/hooks/tech/useTechOrders";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { useTechRequestsStore } from "@/src/stores/tech-requests-store";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import RequestDetailsModal from "./RequestReviewModal";
import type { TechnicianOrder } from "@/src/features/schedule/schemas/response.schema";

const CARD_WIDTH_RATIO = 0.72;

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function RequestCard({
  item,
  index,
  cardWidth,
  CategoryIcon,
  categoryColor,
  themeColors,
}: {
  item: TechnicianOrder;
  index: number;
  cardWidth: number;
  CategoryIcon: LucideIcon;
  categoryColor: string;
  themeColors: ThemePalette;
}) {
  const openModal = useTechRequestsStore((s) => s.openModal);
  const acceptMutation = useAcceptOrderMutation();
  const rejectMutation = useRejectOrderMutation();
  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={{ width: cardWidth, marginRight: 12 }}
    >
      <TouchableOpacity activeOpacity={0.95} onPress={() => openModal(item)}>
        <View
          className="rounded-2xl bg-surface p-4"
          style={{
            borderWidth: 1,
            borderColor: themeColors.borderDefault,
            shadowColor: themeColors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {/* Top row: category icon + title + received time */}
          <View className="mb-2 flex-row items-center gap-2">
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${categoryColor}18` }}
            >
              <CategoryIcon size={20} color={categoryColor} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                className="text-sm font-bold text-content"
                style={{ fontFamily: "GoogleSans_600SemiBold" }}
                numberOfLines={1}
              >
                Service Request
              </Text>
              <Text className="text-[10px] uppercase text-content-muted">
                Received {timeAgo(item.created_at)}
              </Text>
            </View>
          </View>

          {/* Scheduled date */}
          <Text className="mb-2 text-xs text-content-muted">
            📅 {item.scheduled_date}
          </Text>

          {/* Problem description — 1 line only */}
          <Text className="mb-1 text-xs text-content-muted" numberOfLines={1}>
            {item.problem_description ?? "No description provided."}
          </Text>

          <Text
            className="mb-3 text-[11px]"
            style={{
              color: themeColors.primary,
              fontFamily: "GoogleSans_600SemiBold",
            }}
          >
            Tap to view details →
          </Text>

          {/* Action buttons */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              className="flex-1 items-center rounded-xl py-2.5"
              style={{
                backgroundColor: isBusy
                  ? themeColors.borderDefault
                  : themeColors.primary,
              }}
              activeOpacity={0.85}
              disabled={isBusy}
              onPress={() => acceptMutation.mutate(item.id)}
            >
              {acceptMutation.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={themeColors.surfaceBase}
                />
              ) : (
                <Text
                  className="text-xs font-bold text-white"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Accept
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 items-center rounded-xl border py-2.5"
              style={{
                borderColor: themeColors.borderDefault,
                backgroundColor: isBusy
                  ? themeColors.surfaceElevated
                  : themeColors.surfaceBase,
              }}
              activeOpacity={0.7}
              disabled={isBusy}
              onPress={() => rejectMutation.mutate(item.id)}
            >
              {rejectMutation.isPending ? (
                <ActivityIndicator size="small" color={themeColors.textMuted} />
              ) : (
                <Text
                  className="text-xs font-bold text-content"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Decline
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function IncomingRequestsSection() {
  const { width } = useWindowDimensions();
  const themeColors = useThemeColors();
  const cardWidth = width * CARD_WIDTH_RATIO;
  const { data: pendingOrders, isLoading } = usePendingOrders();
  const { data: profile } = useTechSelfProfileQuery();

  const category = CATEGORIES.find(
    (c) =>
      c.label.toLowerCase() === (profile?.category_name ?? "").toLowerCase(),
  );
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? themeColors.primary;

  return (
    <View className="mt-6">
      {/* Section header */}
      <View className="mb-3 flex-row items-center justify-between px-4">
        <Text className="text-xs font-bold uppercase tracking-widest text-content-muted">
          Incoming Requests
        </Text>
        {pendingOrders.length > 0 && (
          <View
            className="h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: themeColors.primary }}
          >
            <Text
              style={{
                fontSize: 10,
                color: themeColors.surfaceBase,
                fontFamily: "GoogleSans_700Bold",
              }}
            >
              {pendingOrders.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={themeColors.primary} />
        </View>
      ) : pendingOrders.length === 0 ? (
        <View
          className="mx-4 items-center rounded-2xl bg-surface px-4 py-6"
          style={{ borderWidth: 1, borderColor: themeColors.borderDefault }}
        >
          <Text className="text-sm text-content-muted">
            No pending requests
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {pendingOrders.map((item, index) => (
            <RequestCard
              key={item.id}
              item={item}
              index={index}
              cardWidth={cardWidth}
              CategoryIcon={CategoryIcon}
              categoryColor={categoryColor}
              themeColors={themeColors}
            />
          ))}
        </ScrollView>
      )}

      {/* Single modal instance for all cards */}
      <RequestDetailsModal />
    </View>
  );
}
