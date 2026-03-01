import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Grid2X2 } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

export default function CategoriesScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface-gray">
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: Colors.brandLight }}
      >
        <Grid2X2 size={28} color={Colors.brand} strokeWidth={1.8} />
      </View>
      <Text className="text-xl font-bold text-content">Categories</Text>
      <Text className="mt-2 text-sm text-content-muted">Coming soon</Text>
    </View>
  );
}
