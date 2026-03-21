import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

export default function SearchBar() {
  return (
    <View className="px-5 pb-4 pt-1">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: Colors.whiteOverlay,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 10,
        }}
      >
        <Search size={18} color={Colors.overlaySub} strokeWidth={2} />
        <TextInput
          placeholder="Search services & technicians"
          placeholderTextColor={Colors.overlaySub}
          editable={false}
          style={{
            flex: 1,
            fontSize: 15,
            color: Colors.white,
            fontFamily: "GoogleSans_400Regular",
            padding: 0,
          }}
        />
      </View>
    </View>
  );
}
