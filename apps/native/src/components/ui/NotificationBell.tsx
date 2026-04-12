import { TouchableOpacity, View } from "react-native";
import { Bell } from "lucide-react-native";
import { Colors, useThemeColors } from "@/src/lib/theme";

interface NotificationBellProps {
  /** Background color of the circular button. Defaults to `Colors.overlayMd`. */
  readonly bgColor?: string;
  /** Icon color for header contexts that should always stay bright. */
  readonly iconColor?: string;
}

export default function NotificationBell({
  bgColor = Colors.overlayMd,
  iconColor,
}: NotificationBellProps) {
  const themeColors = useThemeColors();
  const resolvedIconColor = iconColor ?? themeColors.onPrimaryHeader;

  return (
    <TouchableOpacity
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: bgColor }}
      activeOpacity={0.7}
    >
      <Bell size={20} color={resolvedIconColor} strokeWidth={1.8} />
      <View
        className="absolute right-2 top-2 h-2 w-2 rounded-full"
        style={{ backgroundColor: Colors.danger }}
      />
    </TouchableOpacity>
  );
}
