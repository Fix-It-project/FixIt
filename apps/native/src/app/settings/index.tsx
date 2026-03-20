import { router } from "expo-router";
import { CircleHelp, Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { SettingsItem } from "@/src/components/shared/settings/SettingsItem";

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
