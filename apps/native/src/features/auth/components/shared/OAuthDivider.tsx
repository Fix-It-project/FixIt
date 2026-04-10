import { View, Text } from "react-native";
import { useGoogleOAuth } from "@/src/hooks/auth/useGoogleOAuth";
import SocialLoginButtons from "./SocialLoginButtons";

export default function OAuthDivider() {
  const { signInWithGoogle } = useGoogleOAuth();

  return (
    <>
      <View className="my-2 flex-row items-center">
        <View className="h-[1px] flex-1 bg-edge" />
        <Text className="px-4 text-[12px] text-surface-muted">
          Or continue with
        </Text>
        <View className="h-[1px] flex-1 bg-edge" />
      </View>
      <SocialLoginButtons onPress={signInWithGoogle} />
    </>
  );
}
