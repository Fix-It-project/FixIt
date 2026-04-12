import { View, TouchableOpacity, ScrollView } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";
import { SORT_OPTIONS, type SortKey } from "@/src/features/technicians/types/sort";

export type { SortKey } from "@/src/features/technicians/types/sort";
export { SORT_OPTIONS } from "@/src/features/technicians/types/sort";

interface TechnicianSortBarProps {
  activeSort: SortKey;
  onSortPress: (option: SortKey) => void;
}

export default function TechnicianSortBar({ activeSort, onSortPress }: TechnicianSortBarProps) {
  return (
    <View className="bg-white py-2.5" style={{ borderBottomWidth: 1, borderBottomColor: Colors.borderDefault }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <View
          className="mr-1 h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: Colors.surfaceElevated }}
        >
          <SlidersHorizontal size={16} color={Colors.surfaceMuted} strokeWidth={2} />
        </View>
        {SORT_OPTIONS.map((option) => {
          const isActive = activeSort === option;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => onSortPress(option)}
              activeOpacity={0.7}
              className="items-center justify-center rounded-full px-4"
              style={{
                height: 32,
                backgroundColor: isActive ? Colors.primary : Colors.surfaceElevated,
              }}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{
                  fontFamily: "GoogleSans_600SemiBold",
                  color: isActive ? Colors.surfaceBase : Colors.textSecondary,
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}