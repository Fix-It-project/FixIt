import { View, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";

export function SettingsItem({
  icon: Icon,
  label,
  onPress,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-light">
        <Icon size={18} color="#036ded" strokeWidth={1.8} />
      </View>
      <Text className="flex-1 text-[15px] font-medium text-content">{label}</Text>
      <ChevronRight size={18} color="#555555" strokeWidth={1.8} />
    </TouchableOpacity>
  );
}
