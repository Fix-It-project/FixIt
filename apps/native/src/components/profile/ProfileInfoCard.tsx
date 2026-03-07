import { View, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Mail, Phone, MapPin } from "lucide-react-native";
import type { UserProfile } from "@/src/services/users/types/user";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-light">
        <Icon size={18} color="#036ded" strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-content-muted">{label}</Text>
        <Text className="text-[15px] font-medium text-content">{value}</Text>
      </View>
    </View>
  );
}

interface ProfileInfoCardProps {
  profile: UserProfile | undefined;
  isLoading: boolean;
}

export default function ProfileInfoCard({ profile, isLoading }: ProfileInfoCardProps) {
  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color="#036ded" />
      </View>
    );
  }

  const primaryAddress = profile?.addresses?.[0];
  const addressText = primaryAddress
    ? `${primaryAddress.building_no} ${primaryAddress.street}, ${primaryAddress.city}`
    : "No address added";

  return (
    <View className="mt-3 px-5">
      <View
        className="rounded-2xl bg-surface-white px-5 py-2 shadow-sm"
        style={{ elevation: 3 }}
      >
        <InfoRow icon={Mail} label="Email" value={profile?.email ?? "—"} />
        <View className="h-px bg-edge-outline" />
        <InfoRow icon={Phone} label="Phone" value={profile?.phone ?? "Not provided"} />
        <View className="h-px bg-edge-outline" />
        <InfoRow icon={MapPin} label="Address" value={addressText} />
      </View>
    </View>
  );
}
