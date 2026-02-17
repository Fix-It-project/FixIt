import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="get-started" />
      <Stack.Screen name="role-selection" />
      <Stack.Screen name="login" />
      <Stack.Screen name="User/signup" />
      <Stack.Screen name="Technician/signup" />
      <Stack.Screen name="Technician/signup-step2" />
      <Stack.Screen name="Technician/signup-step3" />
      <Stack.Screen name="Technician/signup-step4" />
      <Stack.Screen name="(forgotpassword)" />
    </Stack>
  );
}
