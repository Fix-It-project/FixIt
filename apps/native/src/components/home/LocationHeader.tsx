import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { MapPin, ChevronDown, Bell } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

interface LocationHeaderProps {
  location?: string;
  onLocationPress?: () => void;
}

export default function LocationHeader({
  location = "Cairo, Egypt",
  onLocationPress,
}: LocationHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
      {/* Location dropdown – translucent pill on blue header */}
      <TouchableOpacity
        onPress={onLocationPress}
        className="flex-row items-center gap-2 rounded-full px-3 py-2"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
        activeOpacity={0.7}
      >
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
        >
          <MapPin size={16} color="#ffffff" strokeWidth={2} />
        </View>

        <View>
          <Text className="text-xs" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Your Location
          </Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-[15px] font-semibold text-white" style={{ fontFamily: "GoogleSans_600SemiBold" }}>
              {location}
            </Text>
            <ChevronDown size={16} color="#ffffff" strokeWidth={2} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Notification bell */}
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        activeOpacity={0.7}
      >
        <Bell size={20} color="#ffffff" strokeWidth={1.8} />
        {/* Notification dot */}
        <View
          className="absolute right-2 top-2 h-2 w-2 rounded-full"
          style={{ backgroundColor: Colors.error }}
        />
      </TouchableOpacity>
    </View>
  );
}
