import { View, TouchableOpacity } from "react-native";
import { Text } from "@/src/components/ui/text";
import { getAvatarColor } from "@/src/lib/helpers/technician-utils";

interface TechnicianAvatarProps {
  readonly id: string;
  readonly initials: string;
  readonly size?: "sm" | "lg";
  readonly onPress?: () => void;
}

const sizeClasses = {
  sm: "h-14 w-14",
  lg: "h-20 w-20",
} as const;

const fontSizes = {
  sm: "text-[16px]",
  lg: "text-[28px]",
} as const;

export default function TechnicianAvatar({
  id,
  initials,
  size = "sm",
  onPress,
}: TechnicianAvatarProps) {
  const content = (
    <View
      className={`${sizeClasses[size]} items-center justify-center rounded-full`}
      style={{ backgroundColor: getAvatarColor(id) }}
    >
      <Text
        className={`${fontSizes[size]} font-bold text-white`}
        style={{ fontFamily: "GoogleSans_700Bold" }}
      >
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
