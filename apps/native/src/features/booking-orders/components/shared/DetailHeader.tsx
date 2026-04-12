import { ChevronLeft, ClipboardList, type LucideIcon } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import { Colors } from "@/src/lib/theme";
import { useThemeColors } from "@/src/lib/theme";

interface Props {
  readonly categoryId: string | null | undefined;
  readonly onBack: () => void;
  readonly title: string;
}

export default function DetailHeader({ categoryId, onBack, title }: Props) {
  const themeColors = useThemeColors();
  const category = categoryId ? CATEGORIES.find((c) => c.id === categoryId) : undefined;
  const CategoryIcon: LucideIcon = category?.icon ?? ClipboardList;
  const categoryColor = category?.color ?? Colors.primary;

  return (
    <View
      className="flex-row items-center gap-3 px-4 pb-4 pt-2"
      style={{ backgroundColor: themeColors.surfaceBase }}
    >
      <TouchableOpacity
        onPress={onBack}
        className="h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: themeColors.surfaceElevated }}
      >
        <ChevronLeft size={20} color={themeColors.textPrimary} />
      </TouchableOpacity>
      <Text
        style={{
          fontFamily: "GoogleSans_700Bold",
          fontSize: 18,
          color: themeColors.textPrimary,
          flex: 1,
        }}
      >
        {title}
      </Text>
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${categoryColor}18` }}
      >
        <CategoryIcon size={18} color={categoryColor} strokeWidth={1.8} />
      </View>
    </View>
  );
}
