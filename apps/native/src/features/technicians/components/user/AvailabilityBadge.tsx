import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { CircleCheck, Clock } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

interface AvailabilityBadgeProps {
  readonly isAvailable: boolean;
}

export default function AvailabilityBadge({ isAvailable }: AvailabilityBadgeProps) {
  if (isAvailable) {
    return (
      <View
        className="flex-row items-center self-start rounded-full px-2 py-0.5"
        style={{ backgroundColor: Colors.statusAvailable, gap: 3 }}
      >
        <CircleCheck size={11} color={Colors.success} strokeWidth={2.5} />
        <Text
          className="font-semibold text-[10px] text-success"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
        >
          Available Now
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-row items-center self-start rounded-full px-2 py-0.5"
      style={{ backgroundColor: Colors.surfaceElevated, gap: 3 }}
    >
      <Clock size={11} color={Colors.surfaceMuted} strokeWidth={2.5} />
      <Text
        className="font-semibold text-[10px] text-surface-muted"
        style={{ fontFamily: "GoogleSans_600SemiBold" }}
      >
        Unavailable
      </Text>
    </View>
  );
}
