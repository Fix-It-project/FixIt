import { ActivityIndicator, Modal, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

interface Props {
  readonly visible: boolean;
  readonly clientName: string | null | undefined;
  readonly reason: string;
  readonly onReasonChange: (text: string) => void;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly isLoading: boolean;
}

export default function BookingCancelModal({
  visible,
  clientName,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
  isLoading,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{ width: "88%", backgroundColor: Colors.surfaceBase, borderRadius: 20, padding: 20 }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: Colors.textPrimary }}>
              Cancel Booking
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: Colors.surfaceElevated }}
            >
              <X size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 }}>
            Are you sure you want to cancel the booking with{" "}
            <Text style={{ fontFamily: "GoogleSans_600SemiBold", color: Colors.textPrimary }}>
              {clientName ?? "this client"}
            </Text>
            ?
          </Text>

          <TextInput
            value={reason}
            onChangeText={onReasonChange}
            placeholder="Reason for cancellation (optional)"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: Colors.borderDefault,
              borderRadius: 14,
              padding: 14,
              fontSize: 14,
              color: Colors.textPrimary,
              textAlignVertical: "top",
              minHeight: 80,
              marginBottom: 16,
            }}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1, alignItems: "center", borderRadius: 14, paddingVertical: 12,
                borderWidth: 1, borderColor: Colors.borderDefault, backgroundColor: Colors.surfaceBase,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.textPrimary }}>
                Keep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1, alignItems: "center", borderRadius: 14, paddingVertical: 12,
                backgroundColor: isLoading ? Colors.borderDefault : Colors.danger,
              }}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.surfaceBase} />
              ) : (
                <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: Colors.surfaceBase }}>
                  Cancel Booking
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
