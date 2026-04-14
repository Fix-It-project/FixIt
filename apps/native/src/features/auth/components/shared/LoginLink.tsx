import { View, Text, Pressable } from "react-native";
import { router, type Href } from "expo-router";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

interface LoginLinkProps {
  readonly route?: Href;
  readonly prefixText?: string;
  readonly actionText?: string;
}

export default function LoginLink({
  route = ROUTES.auth.login,
  prefixText = "Already have an account? ",
  actionText = "Log In",
}: LoginLinkProps) {
  const goToLogin = useDebounce(() => router.push(route));

  return (
    <View className="mt-4 mb-8 flex-row items-center justify-center">
      <Text className="text-[14px] text-content-secondary">
        {prefixText}
      </Text>
      <Pressable onPress={goToLogin}>
        <Text className="font-bold text-[14px] text-app-primary">{actionText}</Text>
      </Pressable>
    </View>
  );
}
