import { CircleHelp, Shield } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { SettingsItem } from "./SettingsItem";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

interface SettingsContentProps {
  readonly onPrivacyPress: () => void;
  readonly onHelpPress: () => void;
}

export default function SettingsContent({
  onPrivacyPress,
  onHelpPress,
}: SettingsContentProps) {
  return (
    <ScrollView className="flex-1 bg-surface-elevated" contentContainerClassName="gap-5 px-5 py-6">
      <View className="rounded-2xl bg-surface px-5 py-4 shadow-sm" style={{ elevation: 2 }}>
        <Text className="mb-3 text-sm font-semibold text-content-secondary">Appearance</Text>
        <ThemeSegmentedControl />
      </View>

      <View className="rounded-2xl bg-surface px-5 shadow-sm" style={{ elevation: 2 }}>
        <SettingsItem
          icon={Shield}
          label="Privacy & Security"
          onPress={onPrivacyPress}
        />
        <Separator />
        <SettingsItem
          icon={CircleHelp}
          label="Help & Support"
          onPress={onHelpPress}
        />
      </View>
    </ScrollView>
  );
}
