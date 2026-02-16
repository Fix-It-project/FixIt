import { create } from "zustand";
import * as Location from "expo-location";

interface LocationState {
  location: { latitude: number; longitude: number } | null;
  permissionStatus: "undetermined" | "granted" | "denied";
  isLoading: boolean;
  requestLocationPermission: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  permissionStatus: "undetermined",
  isLoading: false,

  requestLocationPermission: async () => {
    set({ isLoading: true });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        set({ permissionStatus: "denied", isLoading: false });
        return;
      }

      set({ permissionStatus: "granted" });

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      set({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      });
    } catch (error) {
      console.error("Error getting location:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
