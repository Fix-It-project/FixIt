import { Stack } from "expo-router";

export default function ForgotPasswordLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
