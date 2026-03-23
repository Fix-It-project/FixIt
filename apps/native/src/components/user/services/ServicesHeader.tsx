import { View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import BackButton from "@/src/components/ui/BackButton";

interface ServicesHeaderProps {
  readonly categoryName: string;
  readonly categoryColor: string;
  readonly CategoryIcon: LucideIcon;
}

export default function ServicesHeader({ categoryName, categoryColor, CategoryIcon }: ServicesHeaderProps) {
  return (
    <View style={{ backgroundColor: categoryColor }} className="pb-5">
      <View className="flex-row items-center px-4 pb-1 pt-2">
        <BackButton variant="light" className="mr-3" />
        <View className="flex-1">
          <Text
            className="text-[20px] font-bold text-white"
            style={{ fontFamily: "GoogleSans_700Bold" }}
            numberOfLines={1}
          >
            {categoryName}
          </Text>
          <Text
            className="text-[12px] text-white/70"
            style={{ fontFamily: "GoogleSans_400Regular" }}
          >
            Choose a service
          </Text>
        </View>
        <View className="h-10 w-10 items-center justify-center rounded-full bg-overlay-md">
          <CategoryIcon size={20} color="#ffffff" strokeWidth={1.75} />
        </View>
      </View>
    </View>
  );
}
