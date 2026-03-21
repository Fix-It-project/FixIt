import { TouchableOpacity, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

interface SectionEndArrowProps {
  onPress?: () => void;
}

export default function SectionEndArrow({ onPress }: SectionEndArrowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="ml-1 w-14 items-center justify-center"
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-brand">
        <ChevronRight size={26} color={Colors.white} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}
