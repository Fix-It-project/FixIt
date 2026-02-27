import type { ReactNode } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import KeyboardWrapper from "./KeyboardWrapper";

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
    <KeyboardWrapper>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="ml-4 mt-6 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
        >
          <ArrowLeft size={24} color="#141118" />
        </Pressable>

        {/* Header */}
        <View className="mb-10 mt-5 px-7">
          <Text className="mb-2 text-[32px] font-bold leading-[48px] text-[#141118]">
            {title}
          </Text>
          <Text className="text-[16px] leading-[24px] text-[#735f8c]">
            {subtitle}
          </Text>
        </View>

        {/* Form Content */}
        <View className="gap-6 px-7">
          {children}
        </View>
      </ScrollView>
    </KeyboardWrapper>
  );
}
