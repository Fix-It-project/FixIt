import "../../global.css";

import { useFonts } from "@expo-google-fonts/google-sans";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { vars } from "react-native-css-interop";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CustomToast } from "@/src/components/ui/toast";
import { useAndroidSystemUi } from "@/src/hooks/useAndroidSystemUi";
import { useAppBootstrap } from "@/src/hooks/useAppBootstrap";
import { useRecoveryDeepLink } from "@/src/hooks/useRecoveryDeepLink";
import queryClient from "@/src/lib/query-client";
import {
	createNavigationTheme,
	fontAssets,
	getThemeVariableRecord,
	useThemeTokens,
} from "@/src/lib/theme";

SplashScreen.preventAutoHideAsync();

Sentry.init({
	dsn: "https://bd466622828fff10dd93d712742852e5@o4510789900500992.ingest.us.sentry.io/4510789900763136",
	enableLogs: true,
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	integrations: [Sentry.mobileReplayIntegration()],
});

const styles = StyleSheet.create({
	container: { flex: 1 },
});

function RootLayout() {
	const [fontsLoaded] = useFonts(fontAssets);
	const { isReady } = useAppBootstrap(fontsLoaded);
	const tokens = useThemeTokens();
	const navigationTheme = useMemo(
		() => createNavigationTheme(tokens),
		[tokens.id],
	);
	const themeVariables = useMemo(
		() => vars(getThemeVariableRecord(tokens)),
		[tokens.id],
	);

	useRecoveryDeepLink();
	useAndroidSystemUi(tokens.androidNavigationBarStyle, isReady);

	useEffect(() => {
		if (isReady) {
			void SplashScreen.hideAsync();
		}
	}, [isReady]);

	if (!isReady) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<QueryClientProvider client={queryClient}>
				<StatusBar style={tokens.statusBarStyle} />

				<GestureHandlerRootView style={styles.container}>
					<ThemeProvider value={navigationTheme}>
						<View className="flex-1 bg-surface" style={themeVariables}>
							<KeyboardProvider>
								<Stack screenOptions={{ headerShown: false }}>
									<Stack.Screen name="index" />
									<Stack.Screen name="(auth)" />
									<Stack.Screen name="user" />
									<Stack.Screen name="technician" />
								</Stack>

								<PortalHost />
								<CustomToast />
							</KeyboardProvider>
						</View>
					</ThemeProvider>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}

export default Sentry.wrap(RootLayout);
