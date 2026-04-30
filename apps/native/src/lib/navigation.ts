import { useNavigation } from "@react-navigation/native";
import { type Href, router } from "expo-router";
import { useCallback } from "react";

/**
 * Navigate back when the current screen has stack history; otherwise replace
 * with a deterministic fallback route so redirected/tab-entered screens don't
 * strand the user on the wrong surface.
 */
export function useSafeBack(fallbackRoute: Href) {
	const navigation = useNavigation();

	return useCallback(() => {
		if (navigation.canGoBack()) {
			navigation.goBack();
			return;
		}

		router.replace(fallbackRoute);
	}, [fallbackRoute, navigation]);
}
