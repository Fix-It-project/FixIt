import { View, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Shield, CircleHelp, ChevronRight } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";

function SettingsItem({
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

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-surface-gray" contentContainerClassName="px-5 py-6">
      <View className="rounded-2xl bg-surface-white px-5 shadow-sm" style={{ elevation: 2 }}>
        <SettingsItem
          icon={Shield}
          label="Privacy & Security"
          onPress={() => router.push("/settings/privacy-security")}
        />
        <View className="h-px bg-edge-outline" />
        <SettingsItem
          icon={CircleHelp}
          label="Help & Support"
          onPress={() => router.push("/settings/help-support")}
        />
      </View>
    </ScrollView>
  );
}
