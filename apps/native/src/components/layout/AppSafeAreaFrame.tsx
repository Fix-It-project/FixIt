import { type ReactNode, useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import {
	SafeAreaInsetsContext,
	useSafeAreaInsets,
} from "react-native-safe-area-context";

const ANDROID_EDGE_TO_EDGE_BOTTOM_FALLBACK = 48;

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export function AppSafeAreaFrame({
	children,
}: Readonly<{ children: ReactNode }>) {
	const insets = useSafeAreaInsets();
	const bottomInset =
		Platform.OS === "android" && insets.bottom === 0
			? ANDROID_EDGE_TO_EDGE_BOTTOM_FALLBACK
			: insets.bottom;
	const childInsets = useMemo(() => ({ ...insets, bottom: 0 }), [insets]);

	return (
		<View style={[styles.container, { paddingBottom: bottomInset }]}>
			<SafeAreaInsetsContext.Provider value={childInsets}>
				{children}
			</SafeAreaInsetsContext.Provider>
		</View>
	);
}
