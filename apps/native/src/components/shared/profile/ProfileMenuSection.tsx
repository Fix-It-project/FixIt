import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Separator } from "@/src/components/ui/separator";
import {
  ChevronRight,
  Pencil,
  MapPin,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

function MenuItem({
  icon: Icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 py-3.5"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          destructive ? "bg-danger-light" : "bg-brand-light"
        }`}
      >
        <Icon
          size={18}
          color={destructive ? Colors.error : Colors.brand}
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
        <ChevronRight size={18} color={Colors.textSecondary} strokeWidth={1.8} />
      )}
    </TouchableOpacity>
  );
}

interface ProfileMenuSectionProps {
  onLogout: () => void;
  isLoggingOut: boolean;
  onEditProfile: () => void;
  onSettings: () => void;
}

export default function ProfileMenuSection({ onLogout, isLoggingOut, onEditProfile, onSettings }: ProfileMenuSectionProps) {
  return (
    <>
      {/* Menu */}
      <View className="mt-5 px-5">
        <View
          className="rounded-2xl bg-surface-white px-5 shadow-sm"
          style={{ elevation: 2 }}
        >
          <MenuItem icon={Pencil} label="Edit Profile" onPress={onEditProfile} />
          <Separator />
          <MenuItem icon={MapPin} label="My Addresses" onPress={() => {}} />
          <Separator />
          <MenuItem icon={Settings} label="Settings" onPress={onSettings} />
        </View>
      </View>

      {/* Logout */}
      <View className="mt-5 px-5">
        <View
          className="rounded-2xl bg-surface-white px-5 shadow-sm"
          style={{ elevation: 2 }}
        >
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
