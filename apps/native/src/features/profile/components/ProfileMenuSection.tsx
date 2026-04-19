import { View, TouchableOpacity } from "react-native";
import {
  ChevronRight,
  ClipboardList,
  Pencil,
  MapPin,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Separator } from "@/src/components/ui/separator";
import { Colors, useThemeColors } from "@/src/lib/theme";

function MenuItem({
  icon: Icon,
  label,
  onPress,
  destructive = false,
}: Readonly<{
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}>) {
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          destructive ? "bg-danger-light" : "bg-app-primary-light"
        }`}
      >
        <Icon
          size={18}
          color={destructive ? Colors.danger : Colors.primary}
          strokeWidth={1.8}
        />
      </View>
      <Text
        className={`flex-1 text-[15px] font-medium ${
          destructive ? "text-danger" : "text-content"
        }`}
      >
        {label}
      </Text>
      {!destructive && (
        <ChevronRight size={18} color={themeColors.textSecondary} strokeWidth={1.8} />
      )}
    </TouchableOpacity>
  );
}

interface ProfileMenuSectionProps {
  readonly onLogout: () => void;
  readonly isLoggingOut: boolean;
  readonly onEditProfile: () => void;
  readonly onSettings: () => void;
  readonly onPastOrders?: () => void;
  readonly onAddresses?: () => void;
}

export default function ProfileMenuSection({
  onLogout,
  isLoggingOut,
  onEditProfile,
  onSettings,
  onPastOrders,
  onAddresses,
}: ProfileMenuSectionProps) {
  return (
    <>
      <View className="mt-5 px-5">
        <View className="rounded-2xl bg-surface px-5 shadow-sm" style={{ elevation: 2 }}>
          <MenuItem icon={Pencil} label="Edit Profile" onPress={onEditProfile} />
          <Separator />

          {onPastOrders && (
            <>
              <MenuItem icon={ClipboardList} label="Past Orders" onPress={onPastOrders} />
              <Separator />
            </>
          )}

          {onAddresses && (
            <>
              <MenuItem icon={MapPin} label="My Addresses" onPress={onAddresses} />
              <Separator />
            </>
          )}

          <MenuItem icon={Settings} label="Settings" onPress={onSettings} />
        </View>
      </View>

      <View className="mt-5 px-5">
        <View className="rounded-2xl bg-surface px-5 shadow-sm" style={{ elevation: 2 }}>
          <MenuItem
            icon={LogOut}
            label={isLoggingOut ? "Logging out…" : "Log Out"}
            onPress={onLogout}
            destructive
          />
        </View>
      </View>
    </>
  );
}
