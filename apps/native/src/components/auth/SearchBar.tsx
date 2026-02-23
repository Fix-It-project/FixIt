import { View, TextInput } from "react-native";
import { Search } from "lucide-react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <View className="h-14 flex-row items-center rounded-full bg-white px-6">
      <Search size={20} color="#99a1af" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#99a1af"
        className="ml-3 flex-1 text-[16px] text-[#141118]"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
