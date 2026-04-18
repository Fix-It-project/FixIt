import { View, TouchableOpacity, ActivityIndicator, Modal, Pressable } from "react-native";
import { Text } from "@/src/components/ui/text";
import { ClipboardList, X, MapPin } from "lucide-react-native";
import { Colors, useThemeColors } from "@/src/lib/theme";
import { useTechRequestsStore } from "@/src/stores/tech-requests-store";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import {
  useAcceptDashboardOrderMutation,
  useRejectDashboardOrderMutation,
} from "../../hooks/useDashboardOrderMutations";

function withAlpha(hexColor: string, alpha: number) {
  const normalized = hexColor.replace("#", "");
  if (normalized.length !== 6) return hexColor;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function RequestReviewModal() {
  const themeColors = useThemeColors();
  const { selectedOrder, isModalVisible, closeModal } = useTechRequestsStore();
  const acceptMutation = useAcceptDashboardOrderMutation();
  const rejectMutation = useRejectDashboardOrderMutation();
  const { data: profile } = useTechSelfProfileQuery();

  const category = CATEGORIES.find(
    (c) => c.label.toLowerCase() === (profile?.category_name ?? "").toLowerCase(),
  );
  const CategoryIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;

  const isBusy = acceptMutation.isPending || rejectMutation.isPending;

  if (!selectedOrder) return null;

  const handleAccept = () => {
    acceptMutation.mutate(selectedOrder.id, { onSuccess: closeModal });
  };

  const handleReject = () => {
    rejectMutation.mutate(selectedOrder.id, { onSuccess: closeModal });
  };

  return (
    <Modal
      visible={isModalVisible}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: withAlpha(themeColors.shadow, 0.4),
          justifyContent: "flex-end",
        }}
        onPress={closeModal}
      >
        <Pressable onPress={() => {}}>
          <View
            style={{
              backgroundColor: themeColors.surfaceBase,
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
                backgroundColor: themeColors.borderDefault,
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
                <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 16, color: themeColors.textPrimary }}>
                  Service Request
                </Text>
                <Text style={{ fontSize: 12, color: themeColors.textMuted, marginTop: 2 }}>
                  Received {timeAgo(selectedOrder.created_at)}
                </Text>
              </View>
              <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
                <X size={20} color={themeColors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Scheduled date */}
            <View
              style={{
                backgroundColor: themeColors.surfaceElevated,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 11, color: themeColors.textMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scheduled Date
              </Text>
              <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: themeColors.textPrimary }}>
                📅 {selectedOrder.scheduled_date}
              </Text>
            </View>

            {/* Location */}
            {selectedOrder.user_address && (
              <View
                style={{
                  backgroundColor: themeColors.surfaceElevated,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <MapPin size={16} color={themeColors.textMuted} strokeWidth={2} />
                <Text style={{ flex: 1, fontSize: 14, color: themeColors.textPrimary }}>
                  {selectedOrder.user_address}
                </Text>
              </View>
            )}

            {/* Problem description */}
            <View
              style={{
                backgroundColor: themeColors.surfaceElevated,
                borderRadius: 12,
                padding: 12,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 11, color: themeColors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Problem Description
              </Text>
              <Text style={{ fontSize: 14, color: themeColors.textPrimary, lineHeight: 20 }}>
                {selectedOrder.problem_description ?? "No description provided."}
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
                  backgroundColor: isBusy ? themeColors.borderDefault : Colors.primary,
                }}
                activeOpacity={0.85}
                disabled={isBusy}
                onPress={handleAccept}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator size="small" color={themeColors.surfaceBase} />
                ) : (
                  <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: themeColors.surfaceBase }}>
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
                  borderColor: themeColors.borderDefault,
                  backgroundColor: isBusy ? themeColors.surfaceElevated : themeColors.surfaceBase,
                }}
                activeOpacity={0.7}
                disabled={isBusy}
                onPress={handleReject}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator size="small" color={themeColors.textMuted} />
                ) : (
                  <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: themeColors.textPrimary }}>
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
