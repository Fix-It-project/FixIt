import * as SplashScreen from "expo-splash-screen";

export function configureLaunchSplashScreen(): void {
	void SplashScreen.preventAutoHideAsync();
	SplashScreen.setOptions({
		duration: 450,
		fade: true,
	});
}

export function hideLaunchSplashScreen(): Promise<void> {
	return SplashScreen.hideAsync();
}
