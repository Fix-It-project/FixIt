import * as NavigationBar from "expo-navigation-bar";
import { Platform } from "react-native";

export async function setAndroidNavigationBar(theme: "light" | "dark") {
	if (Platform.OS !== "android") return;

	try {
		await NavigationBar.setButtonStyleAsync(
			theme === "dark" ? "light" : "dark",
		);
	} catch (error) {
		console.error(
			"[NavigationBar] Failed to set Android navigation bar:",
			error,
		);
	}
}
