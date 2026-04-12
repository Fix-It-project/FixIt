import { View } from "react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

interface Props {
  readonly description: string;
}

export default function BookingDescriptionCard({ description }: Props) {
  return (
    <View
      className="mb-4 rounded-2xl bg-white p-4"
      style={{ borderWidth: 1, borderColor: Colors.borderDefault }}
    >
      <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 13, color: Colors.textPrimary, marginBottom: 8 }}>
        Problem Description
      </Text>
      <Text style={{ fontSize: 13, color: Colors.textSecondary, lineHeight: 20 }}>
        {description}
      </Text>
    </View>
  );
}
