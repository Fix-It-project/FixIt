import { View, TouchableOpacity, ActivityIndicator, Modal, Pressable } from "react-native";
import { Text } from "@/src/components/ui/text";
import { ClipboardList, X, MapPin } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { useTechRequestsStore } from "@/src/stores/tech-requests-store";
import { useAcceptOrderMutation, useRejectOrderMutation } from "@/src/hooks/tech/useTechOrders";
import { useTechSelfProfileQuery } from "@/src/hooks/tech/useTechSelfProfileQuery";
import { CATEGORIES } from "@/src/lib/categories";

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
  const { selectedOrder, isModalVisible, closeModal } = useTechRequestsStore();
  const acceptMutation = useAcceptOrderMutation();
  const rejectMutation = useRejectOrderMutation();
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
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        onPress={closeModal}
      >
        <Pressable onPress={() => {}}>
          <View
            style={{
              backgroundColor: Colors.surfaceBase,
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
                backgroundColor: Colors.borderDefault,
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
                  Received {timeAgo(selectedOrder.created_at)}
                </Text>
              </View>
              <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
                <X size={20} color={Colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Scheduled date */}
            <View
              style={{
                backgroundColor: Colors.surfaceElevated,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scheduled Date
              </Text>
              <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.textPrimary }}>
                📅 {selectedOrder.scheduled_date}
              </Text>
            </View>

            {/* Location */}
            {selectedOrder.user_address && (
              <View
                style={{
                  backgroundColor: Colors.surfaceElevated,
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
                  {selectedOrder.user_address}
                </Text>
              </View>
            )}

            {/* Problem description */}
            <View
              style={{
                backgroundColor: Colors.surfaceElevated,
                borderRadius: 12,
                padding: 12,
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 11, color: Colors.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Problem Description
              </Text>
              <Text style={{ fontSize: 14, color: Colors.textPrimary, lineHeight: 20 }}>
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
                  backgroundColor: isBusy ? Colors.borderDefault : Colors.primary,
                }}
                activeOpacity={0.85}
                disabled={isBusy}
                onPress={handleAccept}
              >
                {acceptMutation.isPending ? (
                  <ActivityIndicator size="small" color={Colors.surfaceBase} />
                ) : (
                  <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.surfaceBase }}>
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
                  borderColor: Colors.borderDefault,
                  backgroundColor: isBusy ? Colors.surfaceElevated : Colors.surfaceBase,
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
