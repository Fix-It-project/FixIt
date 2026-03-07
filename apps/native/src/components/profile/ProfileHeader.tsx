import { View, ActivityIndicator } from "react-native";
import { Text } from "@/src/components/ui/text";
import ProfileAvatar from "./ProfileAvatar";

interface ProfileHeaderProps {
  name: string | null;
  isLoading: boolean;
}

export default function ProfileHeader({ name, isLoading }: ProfileHeaderProps) {
  return (
    <View className="items-center bg-brand pb-12 pt-6">
      <ProfileAvatar name={name} />
      <Text className="mt-3 text-xl font-bold text-white">
        {isLoading ? "Loading…" : (name ?? "User")}
      </Text>
    </View>
  );
}
