import { Image, Linking, TouchableOpacity, View } from "react-native";
import { Colors } from "@/src/lib/colors";
import { Text } from "@/src/components/ui/text";

interface Props {
  readonly uri: string;
}

export default function BookingAttachmentCard({ uri }: Props) {
  return (
    <View
      className="mb-4 overflow-hidden rounded-2xl bg-white"
      style={{ borderWidth: 1, borderColor: Colors.borderLight }}
    >
      <View className="px-4 pt-4 pb-3">
        <Text style={{ fontFamily: "GoogleSans_600SemiBold", fontSize: 13, color: Colors.textPrimary }}>
          Attachment
        </Text>
      </View>
      <TouchableOpacity activeOpacity={0.85} onPress={() => Linking.openURL(uri)}>
        <Image source={{ uri }} style={{ width: "100%", height: 220 }} resizeMode="cover" />
      </TouchableOpacity>
    </View>
  );
}
