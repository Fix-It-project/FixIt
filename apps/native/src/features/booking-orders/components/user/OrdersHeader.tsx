import { View } from "react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

export default function OrdersHeader() {
  return (
    <View
      className="px-4 pb-4 pt-2"
      style={{ backgroundColor: Colors.surfaceBase }}
    >
      <Text style={{ fontFamily: "GoogleSans_700Bold", fontSize: 18, color: Colors.textPrimary }}>
        My Orders
      </Text>
    </View>
  );
}
