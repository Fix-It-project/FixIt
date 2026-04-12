import { X } from "lucide-react-native";
import { ActivityIndicator, Modal, Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly confirmLabel: string;
  readonly isLoading: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
  readonly onReasonChange: (text: string) => void;
  readonly reason: string;
  readonly subjectFallback: string;
  readonly subjectName: string | null | undefined;
  readonly subjectRole: string;
  readonly title: string;
  readonly visible: boolean;
}

export default function CancelReasonModal({
  confirmLabel,
  isLoading,
  onClose,
  onConfirm,
  onReasonChange,
  reason,
  subjectFallback,
  subjectName,
  subjectRole,
  title,
  visible,
}: Props) {
  const themeColors = useThemeColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{ width: "88%", backgroundColor: themeColors.surfaceBase, borderRadius: 20, padding: 20 }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: themeColors.textPrimary }}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: themeColors.surfaceElevated }}
            >
              <X size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 14, color: themeColors.textSecondary, lineHeight: 20, marginBottom: 16 }}>
            Are you sure you want to cancel the {subjectRole} with{" "}
            <Text style={{ fontFamily: "GoogleSans_600SemiBold", color: themeColors.textPrimary }}>
              {subjectName ?? subjectFallback}
            </Text>
            ?
          </Text>

          <TextInput
            value={reason}
            onChangeText={onReasonChange}
            placeholder="Reason for cancellation (optional)"
            placeholderTextColor={themeColors.textMuted}
            multiline
            numberOfLines={3}
            style={{
              borderWidth: 1,
              borderColor: themeColors.borderDefault,
              borderRadius: 14,
              padding: 14,
              fontSize: 14,
              color: themeColors.textPrimary,
              textAlignVertical: "top",
              minHeight: 80,
              marginBottom: 16,
            }}
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                alignItems: "center",
                borderRadius: 14,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: themeColors.borderDefault,
                backgroundColor: themeColors.surfaceBase,
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: themeColors.textPrimary }}>
                Keep
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              style={{
                flex: 1,
                alignItems: "center",
                borderRadius: 14,
                paddingVertical: 12,
                backgroundColor: isLoading ? themeColors.borderDefault : Colors.danger,
              }}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={themeColors.surfaceBase} />
              ) : (
                <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 14, color: themeColors.surfaceBase }}>
                  {confirmLabel}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
