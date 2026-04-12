import { View, TouchableOpacity } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors, useThemeColors } from "@/src/lib/theme";

export function SettingsItem({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  const themeColors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-primary-light">
        <Icon size={18} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <Text className="flex-1 text-[15px] font-medium text-content">{label}</Text>
      <ChevronRight size={18} color={themeColors.textSecondary} strokeWidth={1.8} />
    </TouchableOpacity>
  );
}
