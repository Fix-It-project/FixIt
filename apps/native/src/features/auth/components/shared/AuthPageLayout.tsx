import type { ReactNode } from "react";
import { router } from "expo-router";
import { View, Text, Pressable, ScrollView } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColors } from "@/src/lib/theme";

interface AuthPageLayoutProps {
  readonly title: string;
  readonly subtitle: string;
  readonly children: ReactNode;
}

export default function AuthPageLayout({
  title,
  subtitle,
  children,
}: AuthPageLayoutProps) {
  const themeColors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 bg-app-primary-light"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="ml-5 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          style={{ marginTop: insets.top + 12 }}
        >
          <ArrowLeft size={24} color={themeColors.textPrimary} />
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
        <View className="gap-6 px-7">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
