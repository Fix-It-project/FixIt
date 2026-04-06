import { View, TouchableOpacity, ScrollView } from "react-native";
import { SlidersHorizontal } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/colors";

export const SORT_OPTIONS = ["Recommended", "Top Rated", "Nearest", "Most Reviews"] as const;
export type SortKey = (typeof SORT_OPTIONS)[number];

interface TechnicianSortBarProps {
  activeSort: SortKey;
  onSortPress: (option: SortKey) => void;
}

export default function TechnicianSortBar({ activeSort, onSortPress }: TechnicianSortBarProps) {
  return (
    <View className="bg-white py-2.5" style={{ borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        <View
          className="mr-1 h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: Colors.surfaceGray }}
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
                backgroundColor: isActive ? Colors.brand : Colors.surfaceGray,
              }}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{
                  fontFamily: "GoogleSans_600SemiBold",
                  color: isActive ? Colors.white : Colors.textSecondary,
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