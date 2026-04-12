import { router } from "expo-router";
import { CircleHelp, Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { SettingsItem } from "@/src/components/settings/SettingsItem";
import { Separator } from "@/src/components/ui/separator";
import { useDebounce } from "@/src/hooks/useDebounce";

export default function SettingsScreen() {
  const goToPrivacy = useDebounce(() => router.push("/settings/privacy-security"));
  const goToHelp = useDebounce(() => router.push("/settings/help-support"));

  return (
    <ScrollView className="flex-1 bg-surface-elevated" contentContainerClassName="px-5 py-6">
      <View className="rounded-2xl bg-surface px-5 shadow-sm" style={{ elevation: 2 }}>
        <SettingsItem
          icon={Shield}
          label="Privacy & Security"
          onPress={goToPrivacy}
        />
        <Separator />
        <SettingsItem
          icon={CircleHelp}
          label="Help & Support"
          onPress={goToHelp}
        />
      </View>
    </ScrollView>
  );
}
