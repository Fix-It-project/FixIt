import { View, Text, Pressable } from "react-native";
import { router, type Href } from "expo-router";
import { useDebounce } from "@/src/hooks/useDebounce";

interface LoginLinkProps {
  route?: Href;
}

export default function LoginLink({
  route = "/(auth)/User/login",
}: LoginLinkProps) {
  const goToLogin = useDebounce(() => router.push(route));

  return (
    <View className="mb-8 mt-4 flex-row items-center justify-center">
      <Text className="text-[14px] text-content-secondary">
        Already have an account?{" "}
      </Text>
      <Pressable onPress={goToLogin}>
        <Text className="text-[14px] font-bold text-content-link">Log In</Text>
      </Pressable>
    </View>
  );
}
