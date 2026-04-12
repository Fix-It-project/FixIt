import { TouchableOpacity } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import type { ThemePalette } from "@/src/lib/theme";

interface Props {
  readonly onPress: () => void;
  readonly themeColors: ThemePalette;
}

export default function BookingsCalendarTrigger({
  onPress,
  themeColors,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-1.5 self-end rounded-xl px-3 py-2"
      style={{
        backgroundColor: themeColors.primaryLight,
        shadowColor: themeColors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
      }}
      activeOpacity={0.7}
    >
      <CalendarDays size={14} color={themeColors.primary} strokeWidth={2} />
      <Text
        style={{
          fontSize: 12,
          fontFamily: "GoogleSans_600SemiBold",
          color: themeColors.primary,
        }}
      >
        Jump
      </Text>
    </TouchableOpacity>
  );
}
