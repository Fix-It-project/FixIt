import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Wrench } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

export default function TechniciansScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-elevated">
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: Colors.primaryLight }}
      >
        <Wrench size={28} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <Text className="text-xl font-bold text-content">Technicians</Text>
      <Text className="mt-2 text-sm text-content-muted">Coming soon</Text>
    </View>
  );
}
