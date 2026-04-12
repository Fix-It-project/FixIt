import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Camera, X, Paperclip } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { Colors } from "@/src/lib/colors";

export interface AttachmentInfo {
  uri: string;
  name: string;
  type: string;
}

interface BookingDetailsStepProps {
  readonly selectedDate: string;
  readonly onBack: () => void;
  readonly onConfirm: (description: string, attachment: AttachmentInfo | null) => void;
  readonly isPending: boolean;
}

export default function BookingDetailsStep({
  selectedDate,
  onBack,
  onConfirm,
  isPending,
}: BookingDetailsStepProps) {
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState<AttachmentInfo | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
      const type = asset.mimeType ?? "image/jpeg";
      setAttachment({ uri: asset.uri, name, type });
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const name = asset.fileName ?? `photo_${Date.now()}.jpg`;
      const type = asset.mimeType ?? "image/jpeg";
      setAttachment({ uri: asset.uri, name, type });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Date badge */}
        <View className="mb-4 rounded-xl bg-app-primary-light px-4 py-2.5">
          <Text
            className="text-center text-[13px] font-semibold text-app-primary"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
          >
            Scheduled for: {selectedDate}
          </Text>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text
            className="mb-2 text-[15px] font-semibold text-content"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
          >
            Describe the Problem
          </Text>
          <Text className="mb-3 text-[12px] text-content-muted">
            Optional — help the technician prepare for the job
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="e.g. AC not cooling, making noise when turned on..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            className="rounded-xl border border-edge bg-surface px-4 py-3 text-[14px] text-content"
            style={{
              fontFamily: "GoogleSans_400Regular",
              minHeight: 120,
            }}
          />
        </View>

        {/* Attachment */}
        <View className="mb-4">
          <Text
            className="mb-2 text-[15px] font-semibold text-content"
            style={{ fontFamily: "GoogleSans_600SemiBold" }}
          >
            Attach a Photo
          </Text>
          <Text className="mb-3 text-[12px] text-content-muted">
            Optional — a photo can help diagnose the issue faster
          </Text>

          {attachment ? (
            <View className="overflow-hidden rounded-xl border border-edge">
              <Image
                source={{ uri: attachment.uri }}
                className="h-48 w-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setAttachment(null)}
                className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-shadow/50"
                activeOpacity={0.7}
              >
                <X size={16} color={Colors.surfaceBase} strokeWidth={2.5} />
              </TouchableOpacity>
              <View className="px-3 py-2">
                <Text className="text-[12px] text-content-muted" numberOfLines={1}>
                  {attachment.name}
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-edge bg-surface py-4"
                activeOpacity={0.7}
              >
                <Paperclip size={18} color={Colors.primary} strokeWidth={2} />
                <Text
                  className="text-[13px] font-semibold text-app-primary"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-edge bg-surface py-4"
                activeOpacity={0.7}
              >
                <Camera size={18} color={Colors.primary} strokeWidth={2} />
                <Text
                  className="text-[13px] font-semibold text-app-primary"
                  style={{ fontFamily: "GoogleSans_600SemiBold" }}
                >
                  Camera
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Spacer + buttons */}
        <View className="flex-1 justify-end pb-6">
          <Button
            onPress={() => onConfirm(description, attachment)}
            disabled={isPending}
            className="w-full"
          >
            <Text className="text-[15px] font-semibold text-white">
              {isPending ? "Submitting..." : "Confirm Booking"}
            </Text>
          </Button>

          <TouchableOpacity
            onPress={onBack}
            disabled={isPending}
            className="mt-3 items-center py-2"
            activeOpacity={0.7}
          >
            <Text className="text-[14px] font-medium text-content-muted">
              Back to Date Selection
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
