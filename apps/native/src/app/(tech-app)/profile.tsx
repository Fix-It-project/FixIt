import { View, Alert } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Button } from "@/src/components/ui/button";
import { User, LogOut } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLogoutMutation } from "@/src/hooks/auth/useLogoutMutation";

export default function ProfileScreen() {
  const { user, userType } = useAuthStore();
  const logout = useLogoutMutation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onError: (error) => {
        Alert.alert("Logout failed", error.message || "Something went wrong.");
      },
    });
  };

  return (
    <View className="flex-1 bg-surface-gray px-6 pt-16">
      {/* Profile card */}
      <View
        className="mb-6 items-center rounded-2xl bg-white p-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          className="mb-4 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: Colors.brandLight }}
        >
          <User size={36} color={Colors.brand} strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-bold text-content">
          {user?.email ?? "Technician"}
        </Text>
        <Text className="mt-1 text-sm text-content-muted">
          {userType === "technician" ? "Technician" : "User"}
        </Text>
      </View>

      {/* Logout button */}
      <Button
        variant="destructive"
        onPress={handleLogout}
        disabled={logout.isPending}
        className="flex-row gap-2"
      >
        <LogOut size={18} color={Colors.white} strokeWidth={2} />
        <Text className="font-bold text-white">
          {logout.isPending ? "Logging out…" : "Log Out"}
        </Text>
      </Button>
    </View>
  );
}
