import { router, type Href } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText } from "@/src/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, AlertCircle } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

interface InvalidResetLinkViewProps {
  loginRoute: Href;
}

export default function InvalidResetLinkView({ loginRoute }: InvalidResetLinkViewProps) {
  return (
    <View className="flex-1 bg-app-primary-light">
      <StatusBar style="dark" />

      {/* Top Bar */}
      <View className="flex-row items-center px-4 pt-6 pb-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Header */}
      <View className="px-7 mt-2 mb-6">
        <Text className="text-[26px] font-bold text-content mb-2">
          Invalid Link
        </Text>
        <Text className="text-[15px] text-content-secondary leading-[22px]">
          This password reset link is invalid or has expired
        </Text>
      </View>

      {/* Icon */}
      <View className="items-center mt-6">
        <View className="h-20 w-20 rounded-full bg-red-100 items-center justify-center">
          <AlertCircle size={40} color={Colors.danger} />
        </View>
        <Text className="text-[14px] text-content-secondary mt-4 text-center px-10 leading-[20px]">
          Please request a new password reset link from the login page.
        </Text>
      </View>

      {/* Spacer */}
      <View className="flex-1" />

      {/* Bottom Button */}
      <View className="px-7 pb-10">
        <Button
          variant="outline"
          onPress={() => router.replace(loginRoute)}
          className="border-2 border-app-primary"
        >
          <BtnText className="text-app-primary">Back to Login</BtnText>
        </Button>
      </View>
    </View>
  );
}
