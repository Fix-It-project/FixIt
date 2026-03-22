import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit-profile"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Edit Profile",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
}
