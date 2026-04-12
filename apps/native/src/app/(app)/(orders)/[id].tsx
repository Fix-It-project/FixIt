import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/src/lib/colors";
import { useUserOrderById, useCancelOrderByUserMutation } from "@/src/hooks/orders/useUserOrders";
import OrderDetailHeader from "@/src/features/booking-orders/components/user/OrderDetailHeader";
import OrderTechnicianCard from "@/src/features/booking-orders/components/user/OrderTechnicianCard";
import OrderInfoSection from "@/src/features/booking-orders/components/user/OrderInfoSection";
import OrderStatusBanner from "@/src/features/booking-orders/components/user/OrderStatusBanner";
import OrderActionButtons from "@/src/features/booking-orders/components/user/OrderActionButtons";
import OrderCancelModal from "@/src/features/booking-orders/components/user/OrderCancelModal";
import BookingDescriptionCard from "@/src/features/booking-orders/components/shared/BookingDescriptionCard";
import BookingAttachmentCard from "@/src/features/booking-orders/components/shared/BookingAttachmentCard";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useUserOrderById(id);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelMutation = useCancelOrderByUserMutation();

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-elevated">
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const canCancel = order.status === "pending" || order.status === "accepted";

  const handleCancelConfirm = () => {
    cancelMutation.mutate(
      { orderId: order.id, reason: cancelReason.trim() || undefined },
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
        <OrderDetailHeader order={order} />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <OrderStatusBanner status={order.status} cancellationReason={order.cancellation_reason} />
          <OrderTechnicianCard order={order} />
          <OrderInfoSection order={order} />

          {order.problem_description && (
            <BookingDescriptionCard description={order.problem_description} />
          )}
          {order.attachment && <BookingAttachmentCard uri={order.attachment} />}

          {canCancel && (
            <OrderActionButtons
              onReschedule={handleReschedule}
              onCancel={() => setCancelModalVisible(true)}
            />
          )}
        </ScrollView>
      </SafeAreaView>

      {canCancel && (
        <OrderCancelModal
          visible={cancelModalVisible}
          technicianName={order.technician_name}
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
