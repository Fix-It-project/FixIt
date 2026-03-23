import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  Pressable,
} from "react-native";
import { Text } from "@/src/components/ui/text";
import { ClipboardList, X, MapPin, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import Animated, { FadeInRight } from "react-native-reanimated";
import { usePendingOrders, useAcceptOrderMutation, useRejectOrderMutation } from "@/src/hooks/tech/useTechOrders";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { CATEGORIES } from "@/src/lib/categories";
import type { TechnicianOrder } from "@/src/services/tech-calendar/schemas/response.schema";

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

function RequestDetailsModal({
  visible,
  item,
  CategoryIcon,
  categoryColor,
  onClose,
}: {
  visible: boolean;
  item: TechnicianOrder;
  CategoryIcon: LucideIcon;
  categoryColor: string;
  onClose: () => void;
}) {
  const acceptMutation = useAcceptOrderMutation();
  const rejectMutation = useRejectOrderMutation();
  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  const handleAccept = () => {
    acceptMutation.mutate(item.id, { onSuccess: onClose });
  };
  const handleReject = () => {
    rejectMutation.mutate(item.id, { onSuccess: onClose });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        {/* Sheet — stop press propagation so tapping inside doesn't close */}
        <Pressable onPress={() => {}}>
          <View
            style={{
              backgroundColor: Colors.white,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 36,
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: Colors.borderLight,
                alignSelf: "center",
                marginBottom: 20,
              }}
            />

            {/* Header row */}
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: `${categoryColor}18`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <CategoryIcon size={22} color={categoryColor} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 16, color: Colors.textPrimary }}>
                  Service Request
                </Text>
                <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2 }}>
                  Received {timeAgo(item.created_at)}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <X size={20} color={Colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Scheduled date */}
            <View
              style={{
                backgroundColor: Colors.surfaceGray,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scheduled Date
              </Text>
              <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.textPrimary }}>
                📅 {item.scheduled_date}
              </Text>
            </View>

            {/* Location */}
            {item.user_address && (
              <View
                style={{
                  backgroundColor: Colors.surfaceGray,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MapPin size={16} color={Colors.textMuted} strokeWidth={2} />
                <Text style={{ flex: 1, fontSize: 14, color: Colors.textPrimary }}>
                  {item.user_address}
                </Text>
              </View>
            )}

            {/* Problem description */}
            <View
              style={{
                backgroundColor: Colors.surfaceGray,
                borderRadius: 12,
                padding: 12,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Problem Description
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textPrimary, lineHeight: 20 }}>
                {item.problem_description ?? "No description provided."}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 14,
                  paddingVertical: 14,
                  backgroundColor: isBusy ? Colors.borderLight : Colors.brand,
                }}
                activeOpacity={0.85}
                disabled={isBusy}
                onPress={handleAccept}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.white }}>
                    Accept
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRadius: 14,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: isBusy ? Colors.borderLight : Colors.borderLight,
                  backgroundColor: isBusy ? Colors.surfaceGray : Colors.white,
                }}
                activeOpacity={0.7}
                disabled={isBusy}
                onPress={handleReject}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.textMuted} />
                ) : (
                  <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.textPrimary }}>
                    Decline
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RequestCard({
  item,
  index,
  cardWidth,
  CategoryIcon,
  categoryColor,
}: {
  item: TechnicianOrder;
  index: number;
  cardWidth: number;
  CategoryIcon: LucideIcon;
  categoryColor: string;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const acceptMutation = useAcceptOrderMutation();
  const rejectMutation = useRejectOrderMutation();
  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  return (
    <>
      <Animated.View
        entering={FadeInRight.delay(index * 100).duration(400)}
        style={{ width: cardWidth, marginRight: 12 }}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setModalVisible(true)}
        >
          <View
            className="rounded-2xl bg-white p-4"
            style={{
              borderWidth: 1,
              borderColor: Colors.borderLight,
              shadowColor: Colors.shadow,
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
            <Text
              className="mb-1 text-xs text-content-muted"
              numberOfLines={1}
            >
              {item.problem_description ?? "No description provided."}
            </Text>

            {/* See more hint */}
            <Text
              className="mb-3 text-[11px]"
              style={{ color: Colors.brand, fontFamily: "GoogleSans_600SemiBold" }}
            >
              Tap to view details →
            </Text>

            {/* Quick action buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 items-center rounded-xl py-2.5"
                style={{ backgroundColor: isBusy ? Colors.borderLight : Colors.brand }}
                activeOpacity={0.85}
                disabled={isBusy}
                onPress={() => acceptMutation.mutate(item.id)}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.white} />
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
                style={{ borderColor: Colors.borderLight, backgroundColor: isBusy ? Colors.surfaceGray : Colors.white }}
                activeOpacity={0.7}
                disabled={isBusy}
                onPress={() => rejectMutation.mutate(item.id)}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.textMuted} />
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

      <RequestDetailsModal
        visible={modalVisible}
        item={item}
        CategoryIcon={CategoryIcon}
        categoryColor={categoryColor}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

export default function IncomingRequests() {
  const { width } = useWindowDimensions();
  const cardWidth = width * CARD_WIDTH_RATIO;
  const { data: pendingOrders, isLoading } = usePendingOrders();
  const { data: profile } = useTechSelfProfileQuery();

  const category = CATEGORIES.find(
    (c) => c.label.toLowerCase() === (profile?.category_name ?? "").toLowerCase(),
  );
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.brand;

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
            style={{ backgroundColor: Colors.brand }}
          >
            <Text style={{ fontSize: 10, color: Colors.white, fontFamily: "GoogleSans_700Bold" }}>
              {pendingOrders.length}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View className="items-center py-6">
          <ActivityIndicator color={Colors.brand} />
        </View>
      ) : pendingOrders.length === 0 ? (
        <View
          className="mx-4 items-center rounded-2xl bg-white px-4 py-6"
          style={{ borderWidth: 1, borderColor: Colors.borderLight }}
        >
          <Text className="text-sm text-content-muted">No pending requests</Text>
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
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
