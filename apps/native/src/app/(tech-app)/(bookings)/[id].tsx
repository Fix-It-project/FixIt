import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";
import {
  useBookingById,
  useCancelOrderByTechnicianMutation,
  useCompleteOrderMutation,
} from "@/src/hooks/tech/useTechOrders";
import BookingDetailHeader from "@/src/features/booking-orders/components/tech/BookingDetailHeader";
import BookingClientCard from "@/src/features/booking-orders/components/tech/BookingClientCard";
import BookingInfoSection from "@/src/features/booking-orders/components/tech/BookingInfoSection";
import BookingDescriptionCard from "@/src/features/booking-orders/components/shared/BookingDescriptionCard";
import BookingAttachmentCard from "@/src/features/booking-orders/components/shared/BookingAttachmentCard";
import BookingActionButtons from "@/src/features/booking-orders/components/tech/BookingActionButtons";
import BookingCancelModal from "@/src/features/booking-orders/components/tech/BookingCancelModal";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const booking = useBookingById(id);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelMutation = useCancelOrderByTechnicianMutation();
  const completeMutation = useCompleteOrderMutation();

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-elevated">
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const handleComplete = () => {
    Alert.alert(
      "Complete Booking",
      `Mark the booking with ${booking.user_name ?? "this client"} as completed?`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Complete",
          onPress: () =>
            completeMutation.mutate(booking.id, { onSuccess: () => router.back() }),
        },
      ],
    );
  };

  const handleCancelConfirm = () => {
    cancelMutation.mutate(
      { orderId: booking.id, reason: cancelReason.trim() || undefined },
      {
        onSuccess: () => {
          setCancelModalVisible(false);
          setCancelReason("");
          router.back();
        },
      },
    );
  };

  const handleReschedule = () => {
    Alert.alert("Coming Soon", "Rescheduling is not available yet.");
  };

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <BookingDetailHeader booking={booking} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <BookingClientCard booking={booking} />
          <BookingInfoSection booking={booking} />
          {booking.problem_description && (
            <BookingDescriptionCard description={booking.problem_description} />
          )}
          {booking.attachment && <BookingAttachmentCard uri={booking.attachment} />}

          {/* Status banner for non-active orders */}
          {booking.status !== "accepted" ? (
            <View
              className="mt-2 items-center rounded-2xl py-4"
              style={{ backgroundColor: `${booking.status === "completed" ? Colors.success : Colors.danger}12` }}
            >
              <Text
                style={{
                  fontFamily: "GoogleSans_600SemiBold",
                  fontSize: 14,
                  color: booking.status === "completed" ? Colors.success : Colors.danger,
                }}
              >
                {booking.status === "completed"
                  ? "Completed"
                  : booking.status === "cancelled_by_user"
                    ? "Cancelled by client"
                    : "Cancelled by you"}
              </Text>
              {booking.cancellation_reason && (
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 4, paddingHorizontal: 16, textAlign: "center" }}>
                  {booking.cancellation_reason}
                </Text>
              )}
            </View>
          ) : (
            <BookingActionButtons
              onComplete={handleComplete}
              onReschedule={handleReschedule}
              onCancel={() => setCancelModalVisible(true)}
              isCompleting={completeMutation.isPending}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {booking.status === "accepted" && (
        <BookingCancelModal
          visible={cancelModalVisible}
          clientName={booking.user_name}
          reason={cancelReason}
          onReasonChange={setCancelReason}
          onClose={() => setCancelModalVisible(false)}
          onConfirm={handleCancelConfirm}
          isLoading={cancelMutation.isPending}
        />
      )}
    </View>
  );
}
