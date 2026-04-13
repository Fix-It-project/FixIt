import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import { CircleHelp, Mail, MessageCircle, type LucideIcon } from "lucide-react-native";

import { Separator } from "@/src/components/ui/separator";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

function ContactItem({
  icon: Icon,
  label,
  value,
  onPress,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  value: string;
  onPress: () => void;
}>) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-primary-light">
        <Icon size={18} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] text-content-muted">{label}</Text>
        <Text className="text-[15px] font-medium text-app-primary">{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TechnicianHelpSupportScreen() {
  return (
    <ScrollView className="flex-1 bg-surface-elevated" contentContainerClassName="px-5 py-6 gap-4">
      <View className="rounded-2xl bg-surface px-5 py-6 shadow-sm" style={{ elevation: 2 }}>
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-app-primary-light">
          <CircleHelp size={28} color={Colors.primary} strokeWidth={1.8} />
        </View>
        <Text className="text-lg font-bold text-content">Help & Support</Text>
        <Text className="mt-2 text-[14px] leading-5 text-content-muted">
          Need help with jobs, payouts, or your account? Reach out to the FixIt support team and
          we&apos;ll help you get back on track.
        </Text>
      </View>

      <View className="rounded-2xl bg-surface px-5 py-2 shadow-sm" style={{ elevation: 2 }}>
        <ContactItem
          icon={Mail}
          label="Email us"
          value="support@fixit.app"
          onPress={() => {
            void Linking.openURL("mailto:support@fixit.app");
          }}
        />
        <Separator />
        <ContactItem
          icon={MessageCircle}
          label="WhatsApp"
          value="+20 100 000 0000"
          onPress={() => {
            void Linking.openURL("whatsapp://send?phone=201000000000");
          }}
        />
      </View>
    </ScrollView>
  );
}
