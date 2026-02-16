import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

export default function LoginLink() {
  return (
    <View className="mb-8 mt-4 flex-row items-center justify-center">
      <Text className="text-[14px] text-[#735f8c]">
        Already have an account?{" "}
      </Text>
      <Pressable onPress={() => router.push("/(auth)/login")}>
        <Text className="text-[14px] font-bold text-[#0066FF]">Log In</Text>
      </Pressable>
    </View>
  );
}
