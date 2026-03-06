import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { CalendarDays } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

export default function ScheduleScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-gray">
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: Colors.brandLight }}
      >
        <CalendarDays size={28} color={Colors.brand} strokeWidth={1.8} />
      </View>
      <Text className="font-bold text-xl text-content">Schedule</Text>
      <Text className="mt-2 text-sm text-content-muted">Coming soon</Text>
    </View>
  );
}
