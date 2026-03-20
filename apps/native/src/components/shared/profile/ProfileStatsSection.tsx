import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { CalendarDays, BadgeCheck } from "lucide-react-native";

interface StatsCardProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  iconBg: string;
  count: number;
  label: string;
}

function StatsCard({ icon: Icon, iconBg, count, label }: StatsCardProps) {
  return (
    <View
      className="flex-1 items-center rounded-2xl bg-surface-white py-5 shadow-sm"
      style={{ elevation: 2 }}
    >
      <View
        className="mb-3 h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={24} color="#ffffff" strokeWidth={2} />
      </View>
      <Text className="text-2xl font-bold text-content">{count}</Text>
      <Text className="mt-0.5 text-xs text-content-muted">{label}</Text>
    </View>
  );
}

interface ProfileStatsSectionProps {
  bookings: number;
  completed: number;
}

export default function ProfileStatsSection({ bookings, completed }: ProfileStatsSectionProps) {
  return (
    <View className="flex-row gap-3 px-5" style={{ marginTop: -16 }}>
      <StatsCard icon={CalendarDays} iconBg="#06b6d4" count={bookings} label="Bookings" />
      <StatsCard icon={BadgeCheck} iconBg="#a855f7" count={completed} label="Completed" />
    </View>
  );
}
