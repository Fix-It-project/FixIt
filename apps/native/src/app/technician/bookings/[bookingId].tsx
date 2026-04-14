import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/lib/theme";
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
import { useSafeBack } from "@/src/lib/navigation";
import { ROUTES } from "@/src/lib/routes";
import { useFocusBackHandler } from "@/src/hooks/useHardwareBackHandler";

export default function BookingDetailScreen() {
  const themeColors = useThemeColors();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const booking = useBookingById(bookingId);
  const goBack = useSafeBack(ROUTES.technician.bookings);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelMutation = useCancelOrderByTechnicianMutation();
  const completeMutation = useCompleteOrderMutation();

  useFocusBackHandler(() => {
    if (cancelModalVisible) {
      setCancelModalVisible(false);
      return true;
    }

    goBack();
    return true;
  });

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-elevated">
        <ActivityIndicator color={themeColors.primary} />
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
            completeMutation.mutate(booking.id, { onSuccess: () => goBack() }),
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
          goBack();
        },
      },
    );
  };

  const handleReschedule = () => {
    Alert.alert("Coming Soon", "Rescheduling is not available yet.");
  };

  const isCompleted = booking.status === "completed";
  const statusBackgroundColor = isCompleted
    ? themeColors.orderBg
    : themeColors.dangerLight;
  let statusText = "Cancelled by you";
  if (isCompleted) {
    statusText = "Completed";
  } else if (booking.status === "cancelled_by_user") {
    statusText = "Cancelled by client";
  }
  const statusColor = isCompleted ? themeColors.success : themeColors.danger;
  const isAcceptedBooking = booking.status === "accepted";

  return (
    <View className="flex-1 bg-surface-elevated">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <BookingDetailHeader booking={booking} onBack={goBack} />

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
          {isAcceptedBooking ? (
            <BookingActionButtons
              onComplete={handleComplete}
              onReschedule={handleReschedule}
              onCancel={() => setCancelModalVisible(true)}
              isCompleting={completeMutation.isPending}
            />
          ) : (
            <View
              className="mt-2 items-center rounded-2xl py-4"
              style={{ backgroundColor: statusBackgroundColor }}
            >
              <Text
                style={{
                  fontFamily: "GoogleSans_600SemiBold",
                  fontSize: 14,
                  color: statusColor,
                }}
              >
                {statusText}
              </Text>
              {booking.cancellation_reason && (
                <Text style={{ fontSize: 12, color: themeColors.textSecondary, marginTop: 4, paddingHorizontal: 16, textAlign: "center" }}>
                  {booking.cancellation_reason}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {isAcceptedBooking && (
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
