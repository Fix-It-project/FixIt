import { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { MapPin } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import type { Address } from "@/src/services/addresses/types";

interface AddressListItemProps {
  address: Address;
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * A single address row with a radio-button indicator.
 * Tapping triggers the parent to set it as active.
 */
export default function AddressListItem({
  address,
  isActive,
  onPress,
  disabled = false,
}: AddressListItemProps) {
  const active = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    active.value = withTiming(isActive ? 1 : 0, { duration: 200 });
  }, [isActive, active]);

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      active.value,
      [0, 1],
      [Colors.borderLight, Colors.brand],
    ),
    backgroundColor: interpolateColor(
      active.value,
      [0, 1],
      ["transparent", Colors.brand],
    ),
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: active.value,
    transform: [{ scale: active.value }],
  }));

  const detailParts = [
    address.building_no,
    address.apartment_no,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isActive}
      activeOpacity={0.7}
      className="flex-row items-center py-3.5"
      style={{ gap: 12, opacity: disabled ? 0.5 : 1 }}
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
        <Text
          className="mt-0.5 text-[13px] text-content-secondary"
          style={{ fontFamily: "GoogleSans_400Regular" }}
          numberOfLines={2}
        >
          {address.street}
          {detailParts.length > 0 ? `, ${detailParts.join(", ")}` : ""}
        </Text>
      </View>

      {/* Radio button — always rendered, animated */}
      <Animated.View
        className="h-5 w-5 items-center justify-center rounded-full"
        style={[{ borderWidth: 2 }, ringStyle]}
      >
        <Animated.View
          className="h-2.5 w-2.5 rounded-full"
          style={[{ backgroundColor: Colors.white }, dotStyle]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}
