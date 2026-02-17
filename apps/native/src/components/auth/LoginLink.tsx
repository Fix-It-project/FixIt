import { View, Text, Pressable } from "react-native";
import { router, type Href } from "expo-router";

interface LoginLinkProps {
  route?: Href;
}

export default function LoginLink({
  route = "/(auth)/User/login",
}: LoginLinkProps) {
  return (
    <View className="mb-8 mt-4 flex-row items-center justify-center">
      <Text className="text-[14px] text-[#735f8c]">
        Already have an account?{" "}
      </Text>
      <Pressable onPress={() => router.push(route)}>
        <Text className="text-[14px] font-bold text-[#0066FF]">Log In</Text>
      </Pressable>
    </View>
  );
}
