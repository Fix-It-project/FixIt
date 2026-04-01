import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/lib/colors";
import {
  useBookingById,
  useCancelOrderByTechnicianMutation,
  useCompleteOrderMutation,
} from "@/src/hooks/tech/useTechOrders";
import BookingDetailHeader from "@/src/components/tech/booking/BookingDetailHeader";
import BookingClientCard from "@/src/components/tech/booking/BookingClientCard";
import BookingInfoSection from "@/src/components/tech/booking/BookingInfoSection";
import BookingDescriptionCard from "@/src/components/tech/booking/BookingDescriptionCard";
import BookingAttachmentCard from "@/src/components/tech/booking/BookingAttachmentCard";
import BookingActionButtons from "@/src/components/tech/booking/BookingActionButtons";
import BookingCancelModal from "@/src/components/tech/booking/BookingCancelModal";

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const booking = useBookingById(id);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelMutation = useCancelOrderByTechnicianMutation();
  const completeMutation = useCompleteOrderMutation();

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-gray">
        <ActivityIndicator color={Colors.brand} />
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
    <View className="flex-1 bg-surface-gray">
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
          <BookingActionButtons
            onComplete={handleComplete}
            onReschedule={handleReschedule}
            onCancel={() => setCancelModalVisible(true)}
            isCompleting={completeMutation.isPending}
          />
        </ScrollView>
      </SafeAreaView>

      <BookingCancelModal
        visible={cancelModalVisible}
        clientName={booking.user_name}
        reason={cancelReason}
        onReasonChange={setCancelReason}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleCancelConfirm}
        isLoading={cancelMutation.isPending}
      />
    </View>
  );
}
