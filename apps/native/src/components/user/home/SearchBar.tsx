import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";

export default function SearchBar() {
  return (
    <View className="px-5 pb-4 pt-1">
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.18)",
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 11,
          gap: 10,
        }}
      >
        <Search size={18} color="rgba(255, 255, 255, 0.6)" strokeWidth={2} />
        <TextInput
          placeholder="Search services & technicians"
          placeholderTextColor="rgba(255, 255, 255, 0.55)"
          editable={false}
          style={{
            flex: 1,
            fontSize: 15,
            color: "#fff",
            fontFamily: "GoogleSans_400Regular",
            padding: 0,
          }}
        />
      </View>
    </View>
  );
}
