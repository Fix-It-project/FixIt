import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

export default function SearchBar() {
  return (
    <View className="px-5 pb-4 pt-1">
      <View
        className="flex-row items-center gap-2.5 rounded-xl px-3.5 py-3"
        style={{ backgroundColor: Colors.whiteOverlay }}
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
