import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLogoutMutation } from "@/src/hooks/useLogoutMutation";

export default function Home() {
  const { user } = useAuthStore();
  const logout = useLogoutMutation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onError: (error) => {
        Alert.alert("Logout failed", error.message || "Something went wrong.");
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.welcomeLabel}>Welcome,</Text>
        <Text style={styles.fullName}>{user?.email ?? "User"}</Text>
        <Text style={styles.email}>ID: {user?.id ?? "—"}</Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={[styles.logoutButton, logout.isPending && styles.logoutButtonDisabled]}
        activeOpacity={0.8}
        onPress={handleLogout}
        disabled={logout.isPending}
      >
        <Text style={styles.logoutText}>
          {logout.isPending ? "Logging out…" : "Log Out"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 32,
  },
  welcomeLabel: {
    fontSize: 16,
    color: "#888",
    marginBottom: 4,
  },
  fullName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: "#666",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
