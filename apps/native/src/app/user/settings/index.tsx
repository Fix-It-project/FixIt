import { router } from "expo-router";
import { CircleHelp, Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { SettingsItem } from "@/src/components/settings/SettingsItem";
import { ThemeSegmentedControl } from "@/src/components/settings/ThemeSegmentedControl";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

export default function SettingsScreen() {
  const goToPrivacy = useDebounce(() => router.push(ROUTES.user.settingsPrivacy));
  const goToHelp = useDebounce(() => router.push(ROUTES.user.settingsHelp));

  return (
    <ScrollView className="flex-1 bg-surface-elevated" contentContainerClassName="px-5 py-6 gap-5">
      {/* Appearance */}
      <View className="rounded-2xl bg-surface px-5 py-4 shadow-sm" style={{ elevation: 2 }}>
        <Text className="mb-3 text-sm font-semibold text-content-secondary">Appearance</Text>
        <ThemeSegmentedControl />
      </View>

      {/* Other settings */}
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
