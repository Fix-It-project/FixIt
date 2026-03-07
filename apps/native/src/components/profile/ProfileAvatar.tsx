import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { User } from "lucide-react-native";

interface ProfileAvatarProps {
  name: string | null;
}

export default function ProfileAvatar({ name }: ProfileAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <View className="h-24 w-24 items-center justify-center rounded-full bg-white/25">
      {initials ? (
        <Text className="text-3xl font-bold text-white">{initials}</Text>
      ) : (
        <User size={44} color="#ffffff" strokeWidth={1.5} />
      )}
    </View>
  );
}
