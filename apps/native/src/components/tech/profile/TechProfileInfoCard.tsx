import { ActivityIndicator, View } from "react-native";
import { FileText, Mail, Phone, Wrench, type LucideIcon } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Separator } from "@/src/components/ui/separator";
import { Colors } from "@/src/lib/colors";
import type { TechnicianSelfProfile } from "@/src/services/tech-self/schemas/response.schema";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-light">
        <Icon size={18} color={Colors.brand} strokeWidth={1.8} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-content-muted">{label}</Text>
        <Text className="text-[15px] font-medium text-content" numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

interface TechProfileInfoCardProps {
  readonly profile: TechnicianSelfProfile | undefined;
  readonly isLoading: boolean;
}

export default function TechProfileInfoCard({ profile, isLoading }: TechProfileInfoCardProps) {
  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  return (
    <View className="mt-3 px-5">
      <View className="rounded-2xl bg-surface-white px-5 py-2 shadow-sm" style={{ elevation: 3 }}>
        <InfoRow icon={Mail} label="Email" value={profile?.email ?? "—"} />
        <Separator />
        <InfoRow icon={Phone} label="Phone" value={profile?.phone ?? "Not provided"} />
        <Separator />
        <InfoRow icon={Wrench} label="Specialty" value={profile?.category_name ?? "Not assigned"} />
        {!!profile?.description && (
          <>
            <Separator />
            <InfoRow icon={FileText} label="About" value={profile.description} />
          </>
        )}
      </View>
    </View>
  );
}
