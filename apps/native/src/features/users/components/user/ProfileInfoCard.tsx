import { View, ActivityIndicator } from "react-native";
import { Mail, Phone, MapPin, type LucideIcon } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Separator } from "@/src/components/ui/separator";
import { Colors } from "@/src/lib/theme";
import type { UserProfile } from "@/src/features/users/schemas/response.schema";

function InfoRow({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  value: string;
}>) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-app-primary-light">
        <Icon size={18} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-content-muted">{label}</Text>
        <Text className="text-[15px] font-medium text-content" numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

interface ProfileInfoCardProps {
  readonly profile: UserProfile | undefined;
  readonly isLoading: boolean;
}

export default function ProfileInfoCard({ profile, isLoading }: ProfileInfoCardProps) {
  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const primaryAddress = profile?.addresses?.[0];
  const addressText = primaryAddress
    ? `${primaryAddress.building_no} ${primaryAddress.street}, ${primaryAddress.city}`
    : "No address added";

  return (
    <View className="mt-3 px-5">
      <View className="rounded-2xl bg-surface px-5 py-2 shadow-sm" style={{ elevation: 3 }}>
        <InfoRow icon={Mail} label="Email" value={profile?.email ?? "—"} />
        <Separator />
        <InfoRow icon={Phone} label="Phone" value={profile?.phone ?? "Not provided"} />
        <Separator />
        <InfoRow icon={MapPin} label="Address" value={addressText} />
      </View>
    </View>
  );
}
