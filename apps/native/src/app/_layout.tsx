import "../../global.css";
import "@/src/config/reanimated";
import "@/src/config/intl-polyfills";
import "@/src/config/monitoring";
import "@/src/config/i18n";

import { useFonts } from "@expo-google-fonts/google-sans";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useNavigationContainerRef } from "expo-router";
import { ThemeProvider } from "expo-router/react-navigation";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { vars } from "react-native-css-interop";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LaunchSplashOverlay } from "@/src/components/launch/LaunchSplashOverlay";
import { AppSafeAreaFrame } from "@/src/components/layout/AppSafeAreaFrame";
import { DialogProvider } from "@/src/components/ui/dialog";
import { CustomToast } from "@/src/components/ui/toast";
import {
	configureLaunchSplashScreen,
	hideLaunchSplashScreen,
} from "@/src/config/launch-splash";
import { registerNavigationContainer, Sentry } from "@/src/config/monitoring";
import queryClient from "@/src/config/query-client";
import {
	createNavigationTheme,
	fontAssets,
	getThemeVariableRecord,
	useThemeTokens,
} from "@/src/constants/design-tokens";
import { useNotificationRouting } from "@/src/features/notifications/hooks/useNotificationRouting";
import { usePushRegistration } from "@/src/features/notifications/hooks/usePushRegistration";
import { useAndroidSystemUi } from "@/src/hooks/useAndroidSystemUi";
import { useAppBootstrap } from "@/src/hooks/useAppBootstrap";
import { RouteErrorBoundary } from "@/src/lib/errors/error-boundary";

configureLaunchSplashScreen();

const styles = StyleSheet.create({
	container: { flex: 1 },
});

function RootLayout() {
	const [fontsLoaded] = useFonts(fontAssets);
	const { isReady } = useAppBootstrap(fontsLoaded);
	const [showLaunchOverlay, setShowLaunchOverlay] = useState(true);
	usePushRegistration(isReady);
	useNotificationRouting(isReady);
	const tokens = useThemeTokens();
	const navigationRef = useNavigationContainerRef();
	const dismissLaunchOverlay = useCallback(() => {
		setShowLaunchOverlay(false);
	}, []);

	useEffect(() => {
		if (navigationRef?.current) {
			registerNavigationContainer(navigationRef);
		}
	}, [navigationRef]);
	const navigationTheme = useMemo(
		() => createNavigationTheme(tokens),
		[tokens],
	);
	const themeVariables = useMemo(
		() => vars(getThemeVariableRecord(tokens)),
		[tokens],
	);

	useAndroidSystemUi(tokens.androidNavigationBarStyle, isReady);

	useEffect(() => {
		if (isReady) {
			void hideLaunchSplashScreen();
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
							<AppSafeAreaFrame>
								<KeyboardProvider>
									<BottomSheetModalProvider>
										<RouteErrorBoundary>
											<Stack screenOptions={{ headerShown: false }}>
												<Stack.Screen name="index" />
												<Stack.Screen name="(auth)" />
												<Stack.Screen name="user" />
												<Stack.Screen name="technician" />
											</Stack>
										</RouteErrorBoundary>

										<PortalHost />
										<DialogProvider />
										<PortalHost name="dialog-root" />
										<CustomToast />
									</BottomSheetModalProvider>
								</KeyboardProvider>
							</AppSafeAreaFrame>
							{showLaunchOverlay ? (
								<LaunchSplashOverlay
									backgroundColor={tokens.primary}
									onFinish={dismissLaunchOverlay}
								/>
							) : null}
						</View>
					</ThemeProvider>
				</GestureHandlerRootView>
			</QueryClientProvider>
		</SafeAreaProvider>
	);
}

export default Sentry.wrap(RootLayout);
