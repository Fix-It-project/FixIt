import { ActivityIndicator, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileHeaderProps {
  readonly name: string | null;
  readonly isLoading: boolean;
  readonly imageUrl?: string | null;
  readonly onChangePhoto?: () => void;
}

export default function ProfileHeader({
  name,
  isLoading,
  imageUrl,
  onChangePhoto,
}: ProfileHeaderProps) {
  return (
    <View className="items-center bg-app-primary pt-6 pb-12">
      <ProfileAvatar name={name} imageUrl={imageUrl} onChangePhoto={onChangePhoto} />
      <Text className="mt-3 text-xl font-bold text-white">
        {isLoading ? <ActivityIndicator color="white" /> : (name ?? "User")}
      </Text>
    </View>
  );
}
