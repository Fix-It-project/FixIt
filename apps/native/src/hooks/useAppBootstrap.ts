import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLocationStore } from "@/src/stores/location-store";
import { useThemeStore } from "@/src/stores/theme-store";

interface AppBootstrapState {
  isReady: boolean;
}

export function useAppBootstrap(fontsLoaded: boolean): AppBootstrapState {
  const [hasMounted, setHasMounted] = useState(false);
  const hasStartedRef = useRef(false);

  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const loadStoredSession = useAuthStore((state) => state.loadStoredSession);
  const isThemeLoaded = useThemeStore((state) => state.isLoaded);
  const loadThemePreference = useThemeStore((state) => state.loadThemePreference);
  const requestLocationPermission = useLocationStore(
    (state) => state.requestLocationPermission,
  );

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    setHasMounted(true);

    void loadStoredSession();
    void loadThemePreference();
    void requestLocationPermission();
  }, [loadStoredSession, loadThemePreference, requestLocationPermission]);

  const isReady = hasMounted && fontsLoaded && !isAuthLoading && isThemeLoaded;

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void SplashScreen.hideAsync();
  }, [isReady]);

  return { isReady };
}
