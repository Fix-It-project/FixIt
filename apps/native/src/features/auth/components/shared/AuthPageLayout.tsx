import type { ReactNode } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthPageLayout({
  title,
  subtitle,
  children,
}: AuthPageLayoutProps) {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: Colors.primaryLight }}
    >
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="ml-5 mt-14 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
        >
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </Pressable>

        {/* Header */}
        <View className="mb-10 mt-3 px-7">
          <Text className="mb-2 text-[32px] font-bold leading-[48px] text-content">
            {title}
          </Text>
          <Text className="text-[16px] leading-[24px] text-content-secondary">
            {subtitle}
          </Text>
        </View>

        {/* Form Content */}
        <View className="gap-6 px-7">
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
