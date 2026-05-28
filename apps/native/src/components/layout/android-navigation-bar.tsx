import { NavigationBar } from "expo-navigation-bar";
import { Platform } from "react-native";
import { logger } from "@/src/lib/logger";

export function setAndroidNavigationBar(theme: "light" | "dark") {
	if (Platform.OS !== "android") return;

	try {
		NavigationBar.setStyle(theme === "dark" ? "light" : "dark");
	} catch (error) {
		logger.error(
			"NavigationBar",
			"Failed to set Android navigation bar",
			error,
		);
	}
}
