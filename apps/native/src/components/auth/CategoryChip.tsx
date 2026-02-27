import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/src/lib/colors";

interface CategoryChipProps {
  label: string;
  icon: LucideIcon;
  color: string;
  selected: boolean;
  onPress: () => void;
}

/** Convert a hex colour to rgba */
function hexToRgba(hex: string, alpha: number) {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function CategoryChip({
  label,
  icon: Icon,
  color,
  selected,
  onPress,
}: CategoryChipProps) {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.08);

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 100 });
    shadowOpacity.value = withTiming(0.15, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    shadowOpacity.value = withTiming(0.08, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{ color: "rgba(0,0,0,0.06)" }}
    >
      <Animated.View
        className="mx-4 my-1.5 flex-row items-center overflow-hidden rounded-[14px] border-[1.5px] bg-white py-3 pl-0 pr-3.5"
        style={[
          {
            borderColor: selected ? color : Colors.borderChip,
            // basic shadow props
            shadowColor: selected ? color : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 6,
            elevation: 3,
          },
          animatedStyle,
        ]}
      >
        {/* Left spacing/accent bar area (no longer colored) */}
        <View className="mr-3 w-1 self-stretch rounded-md" />

        {/* Icon container */}
        <View
          className="mr-3.5 h-12 w-12 items-center justify-center rounded-[13px] border"
          style={{
            backgroundColor: hexToRgba(color, selected ? 0.22 : 0.13),
            borderColor: hexToRgba(color, selected ? 0.35 : 0.18),
          }}
        >
          <Icon size={24} color={color} strokeWidth={1.75} />
        </View>

        {/* Label */}
        <Text
          className="flex-1 text-[15px] font-semibold tracking-wide text-content"
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Right badge */}
        {selected ? (
          <View
            className="h-6 w-6 items-center justify-center rounded-full"
            style={{ backgroundColor: color }}
          >
            <Check size={13} color={Colors.white} strokeWidth={3} />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
}
