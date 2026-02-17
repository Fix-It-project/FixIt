import { View, Text } from "react-native";
import SocialLoginButtons from "./SocialLoginButtons";

interface OAuthDividerProps {
  variant?: "signup" | "login";
}

export default function OAuthDivider({ variant = "signup" }: OAuthDividerProps) {
  return (
    <>
      <View className="my-2 flex-row items-center">
        <View className="h-[1px] flex-1 bg-[#d1d5dc]" />
        <Text className="px-4 text-[12px] text-[#6a7282]">
          Or continue with
        </Text>
        <View className="h-[1px] flex-1 bg-[#d1d5dc]" />
      </View>
      <SocialLoginButtons variant={variant} />
    </>
  );
}
