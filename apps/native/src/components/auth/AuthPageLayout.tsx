import { type ReactNode, useEffect, useRef } from "react";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardPadding, {
        toValue: e.endCoordinates.height,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardPadding]);

  const content = (
    <>
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
          <Ionicons name="arrow-back" size={24} color="#141118" />
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
    </>
  );

  if (Platform.OS === "ios") {
    return (
      <KeyboardAvoidingView className="flex-1 bg-[#ebeeff]" behavior="padding">
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View
      style={{ flex: 1, backgroundColor: "#ebeeff", paddingBottom: keyboardPadding }}
    >
      {content}
    </Animated.View>
  );
}
