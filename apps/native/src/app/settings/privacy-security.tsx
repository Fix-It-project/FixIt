import { View, ScrollView } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Shield } from "lucide-react-native";

export default function PrivacySecurityScreen() {
  return (
    <ScrollView className="flex-1 bg-surface-gray" contentContainerClassName="px-5 py-6 gap-4">
      <View className="rounded-2xl bg-surface-white px-5 py-6 shadow-sm" style={{ elevation: 2 }}>
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-brand-light">
          <Shield size={28} color="#036ded" strokeWidth={1.8} />
        </View>
        <Text className="text-lg font-bold text-content">Privacy & Security</Text>
        <Text className="mt-2 text-[14px] leading-5 text-content-muted">
          Your data is encrypted and never shared with third parties without your consent.
          We follow industry-standard security practices to keep your account safe.
        </Text>
      </View>

      <View className="rounded-2xl bg-surface-white px-5 py-5 shadow-sm" style={{ elevation: 2 }}>
        <Text className="text-[15px] font-semibold text-content">Data we collect</Text>
        <Text className="mt-1 text-[14px] leading-5 text-content-muted">
          Name, email, phone number, and address — only what's needed to provide the service.
        </Text>
      </View>

      <View className="rounded-2xl bg-surface-white px-5 py-5 shadow-sm" style={{ elevation: 2 }}>
        <Text className="text-[15px] font-semibold text-content">How we use your data</Text>
        <Text className="mt-1 text-[14px] leading-5 text-content-muted">
          Solely to match you with technicians and manage your bookings. We never sell your information.
        </Text>
      </View>
    </ScrollView>
  );
}
