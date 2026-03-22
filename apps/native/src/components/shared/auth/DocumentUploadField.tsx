import { View, Text, Pressable, Image } from "react-native";
import { CheckCircle2, CloudUpload, ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

interface DocumentUploadFieldProps {
  label: string;
  value: string;
  onPick: () => void;
  error?: string;
  required?: boolean;
}

export default function DocumentUploadField({
  label,
  value,
  onPick,
  error,
  required = false,
}: DocumentUploadFieldProps) {
  const hasFile = value.length > 0;

  return (
    <View className="gap-3">
      <Text className="text-[14px] font-semibold text-content">
        {label}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>
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
              <Text className="text-[14px] text-content" numberOfLines={1}>
                Document uploaded
              </Text>
              <Text className="text-[12px] text-surface-muted">Tap to change</Text>
            </View>
            <CheckCircle2 size={22} color={Colors.successAlt} />
          </View>
        ) : (
          <View className="flex-1 flex-row items-center gap-3">
            <View className="items-center justify-center rounded-lg bg-surface-gray p-2.5">
              <CloudUpload size={22} color={Colors.surfaceMuted} />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] text-content">
                Upload document
              </Text>
              <Text className="text-[12px] text-content-muted">
                Take a photo or choose from gallery
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </View>
        )}
      </Pressable>
      {error && (
        <Text className="ml-4 text-[12px] text-red-500">{error}</Text>
      )}
    </View>
  );
}
