import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DocumentUploadFieldProps {
  label: string;
  value: string;
  onPick: () => void;
  error?: string;
}

export default function DocumentUploadField({
  label,
  value,
  onPick,
  error,
}: DocumentUploadFieldProps) {
  const hasFile = value.length > 0;

  return (
    <View className="gap-3">
      <Text className="text-[14px] font-semibold text-[#141118]">{label}</Text>
      <Pressable
        onPress={onPick}
        className={`flex-row items-center rounded-2xl bg-white px-6 py-4 ${
          error ? "border border-red-400" : ""
        }`}
      >
        {hasFile ? (
          <View className="flex-1 flex-row items-center gap-3">
            <Image
              source={{ uri: value }}
              className="h-12 w-12 rounded-lg"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-[14px] text-[#141118]" numberOfLines={1}>
                Document uploaded
              </Text>
              <Text className="text-[12px] text-[#6a7282]">Tap to change</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
          </View>
        ) : (
          <View className="flex-1 flex-row items-center gap-3">
            <View className="items-center justify-center rounded-lg bg-[#f3f4f6] p-2.5">
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color="#6a7282"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] text-[#141118]">
                Upload document
              </Text>
              <Text className="text-[12px] text-[#99a1af]">
                Take a photo or choose from gallery
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#99a1af" />
          </View>
        )}
      </Pressable>
      {error && (
        <Text className="ml-4 text-[12px] text-red-500">{error}</Text>
      )}
    </View>
  );
}
