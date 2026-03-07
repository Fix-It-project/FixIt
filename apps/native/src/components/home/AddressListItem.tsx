import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { MapPin } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import type { Address } from "@/src/services/addresses/types";

interface AddressListItemProps {
  address: Address;
  isActive: boolean;
  onPress: () => void;
  isLoading?: boolean;
}

/**
 * A single address row with a radio-button indicator.
 * Tapping triggers the parent to set it as active.
 */
export default function AddressListItem({
  address,
  isActive,
  onPress,
  isLoading = false,
}: AddressListItemProps) {
  const radioAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isActive ? Colors.brand : "transparent", { duration: 200 }),
    borderColor: withTiming(isActive ? Colors.brand : Colors.borderLight, { duration: 200 }),
  }));

  const labelParts = [address.street, address.city].filter(Boolean);
  const detailParts = [address.building_no, address.apartment_no].filter(Boolean);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.7}
      className="flex-row items-center py-3.5"
      style={{ gap: 12, opacity: isLoading ? 0.5 : 1 }}
    >
      {/* Map pin icon */}
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: Colors.surfaceGray }}
      >
        <MapPin size={18} color={Colors.textSecondary} strokeWidth={2} />
      </View>

      {/* Address text */}
      <View className="flex-1">
        <Text
          className="text-[15px] text-content"
          style={{ fontFamily: "GoogleSans_600SemiBold" }}
          numberOfLines={1}
        >
          {address.city}
        </Text>
        {labelParts.length > 0 && (
          <Text
            className="mt-0.5 text-[13px] text-content-secondary"
            style={{ fontFamily: "GoogleSans_400Regular" }}
            numberOfLines={2}
          >
            {labelParts.join(", ")}
            {detailParts.length > 0 ? `, ${detailParts.join(", ")}` : ""}
          </Text>
        )}
      </View>

      {/* Radio button indicator */}
      <Animated.View
        className="h-5 w-5 items-center justify-center rounded-full"
        style={[{ borderWidth: 2 }, radioAnimatedStyle]}
      >
        {isActive && (
          <View
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: Colors.white }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}
