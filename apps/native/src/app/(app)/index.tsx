import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking } from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLogoutMutation } from "@/src/hooks/auth/useLogoutMutation";
import apiClient from "@/src/lib/api-client";
import { Colors } from "@/src/lib/colors";

export default function Home() {
  const { user, userType } = useAuthStore();
  const logout = useLogoutMutation();
  const [address, setAddress] = useState<Record<string, any> | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!userType) return;

      try {
        const endpoint = userType === "technician" ? "/api/addresses/technician/addresses" : "/api/addresses/user/addresses";
        const response = await apiClient.get(endpoint);
        const addresses = response.data?.addresses || response.data?.data;
        if (addresses && addresses.length > 0) {
          setAddress(addresses[0]);
        }
      } catch (error) {
        console.error("Failed to fetch address", error);
      } finally {
        setLoadingAddress(false);
      }
    };
    fetchAddress();
  }, [userType]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onError: (error) => {
        Alert.alert("Logout failed", error.message || "Something went wrong.");
      },
    });
  };

  const openMap = () => {
    if (address?.latitude && address?.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${address.latitude},${address.longitude}`;
      Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.welcomeLabel}>Welcome,</Text>
        <Text style={styles.fullName}>{user?.email ?? "User"}</Text>
        <Text style={styles.email}>ID: {user?.id ?? "—"}</Text>
        <Text style={styles.status}>Status: {userType === "technician" ? "Technician" : "User"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Address Details</Text>
        {loadingAddress ? (
          <Text style={styles.detailsText}>Loading address...</Text>
        ) : address ? (
          <View>
            <Text style={styles.detailsText}>City: {address.city || "N/A"}</Text>
            <Text style={styles.detailsText}>Street: {address.street || "N/A"}</Text>
            <Text style={styles.detailsText}>Building No: {address.building_no || "N/A"}</Text>
            <Text style={styles.detailsText}>Apartment No: {address.apartment_no || "N/A"}</Text>
            
            {(address.latitude && address.longitude) ? (
              <View style={styles.locationContainer}>
                <Text style={styles.detailsText}>Latitude: {address.latitude}</Text>
                <Text style={styles.detailsText}>Longitude: {address.longitude}</Text>
                <TouchableOpacity onPress={openMap}>
                  <Text style={styles.linkText}>Open in Google Maps</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.detailsText}>Location: Not provided</Text>
            )}
          </View>
        ) : (
          <Text style={styles.detailsText}>No address found.</Text>
        )}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceGray,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  welcomeLabel: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  fullName: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  email: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  status: {
    fontSize: 16,
    color: Colors.brand,
    fontWeight: "600",
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  detailsText: {
    fontSize: 15,
    color: Colors.surfaceMuted,
    marginBottom: 6,
  },
  locationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  linkText: {
    color: Colors.brand,
    fontSize: 15,
    marginTop: 8,
    textDecorationLine: "underline",
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
