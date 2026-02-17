import "../../global.css";

import * as Sentry from '@sentry/react-native';

import { DarkTheme, DefaultTheme, type Theme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/src/lib/query-client";

import { setAndroidNavigationBar } from "@/src/lib/android-navigation-bar";
import { NAV_THEME } from "@/src/lib/constants";
import { useColorScheme } from "@/src/lib/use-color-scheme";
import { useAuthStore } from "@/src/stores/auth-store";
import { useLocationStore } from "@/src/stores/location-store";

Sentry.init({
  dsn: 'https://bd466622828fff10dd93d712742852e5@o4510789900500992.ingest.us.sentry.io/4510789900763136',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/       
  //sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined" ? useEffect : useLayoutEffect;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

function RootLayout() {
  const hasMounted = useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const { isAuthenticated, isLoading, loadStoredSession } = useAuthStore();
  const { requestLocationPermission } = useLocationStore();

  // Load persisted session & request location on first mount
  useEffect(() => {
    loadStoredSession();
    requestLocationPermission();
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }
    setAndroidNavigationBar(colorScheme);
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  // Wait until both colour-scheme AND auth state are resolved
  if (!isColorSchemeLoaded || isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
        <GestureHandlerRootView style={styles.container}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>

          {/* ── Single auth checkpoint ────────────────────────────────────── */}
          {isAuthenticated ? (
            <Redirect href="/(app)" />
          ) : (
            <Redirect href="/(auth)/get-started" />
          )}
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(RootLayout);
