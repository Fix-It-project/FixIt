import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}

export default function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <View className="flex-1 items-center rounded-xl bg-surface-gray px-3 py-3.5" style={{ gap: 4 }}>
      {icon}
      <Text
        className="mt-1 font-bold text-[16px] text-content"
        style={{ fontFamily: "GoogleSans_700Bold" }}
      >
        {value}
      </Text>
      <Text
        className="text-[11px] text-content-muted"
        style={{ fontFamily: "GoogleSans_400Regular" }}
      >
        {label}
      </Text>
    </View>
  );
}
