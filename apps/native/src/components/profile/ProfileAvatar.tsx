import { Image, TouchableOpacity, View } from "react-native";
import { Camera, User } from "lucide-react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";
import { useThemeColors } from "@/src/lib/theme";

interface ProfileAvatarProps {
  readonly name: string | null;
  readonly imageUrl?: string | null;
  readonly onChangePhoto?: () => void;
}

function AvatarContent({ imageUrl, initials }: { readonly imageUrl: string | null | undefined; readonly initials: string | null }) {
  const themeColors = useThemeColors();
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} className="h-24 w-24 rounded-full" resizeMode="cover"/>;
  }
  if (initials) {
    return <Text className="text-3xl font-bold text-white">{initials}</Text>;
  }
  return <User size={44} color={themeColors.surfaceBase} strokeWidth={1.5} />;
}

export default function ProfileAvatar({ name, imageUrl, onChangePhoto }: ProfileAvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <View className="relative h-24 w-24">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-white/25">
        <AvatarContent imageUrl={imageUrl} initials={initials} />
      </View>
      {onChangePhoto && (
        <TouchableOpacity
          onPress={onChangePhoto}
          activeOpacity={0.8}
          className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-white"
          style={{ elevation: 3 }}
        >
          <Camera size={14} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      )}
    </View>
  );
}
