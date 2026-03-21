import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { MapPin, ChevronDown } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { useAddressesQuery } from "@/src/hooks/addresses/useAddressesQuery";
import NotificationBell from "@/src/components/shared/NotificationBell";

interface LocationHeaderProps {
  onLocationPress?: () => void;
}

export default function LocationHeader({
  onLocationPress,
}: LocationHeaderProps) {
  const { data: addresses } = useAddressesQuery();

  // Derive the active address label — fall back to first address or default
  const activeAddress = addresses?.find((a) => a.is_active) ?? addresses?.[0];
  const locationLabel = activeAddress
    ? `${activeAddress.street}, ${activeAddress.city}`
    : "Select Location";

  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
      {/* Location dropdown – translucent pill on blue header */}
      <TouchableOpacity
        onPress={onLocationPress}
        className="flex-row items-center gap-2 rounded-full px-3 py-2"
        style={{ backgroundColor: Colors.overlaySm }}
        activeOpacity={0.7}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: Colors.overlayMd }}
        >
          <MapPin size={16} color={Colors.white} strokeWidth={2} />
        </View>

        <View style={{ maxWidth: 200 }}>
          <Text className="text-xs" style={{ color: Colors.overlayBright }}>
            Your Location
          </Text>
          <View className="flex-row items-center gap-1">
            <Text
              className="text-[15px] font-semibold text-white"
              style={{ fontFamily: "GoogleSans_600SemiBold" }}
              numberOfLines={1}
            >
              {locationLabel}
            </Text>
            <ChevronDown size={16} color={Colors.white} strokeWidth={2} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Notification bell */}
      <NotificationBell />
    </View>
  );
}
