import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeTokens } from "@/src/lib/theme";

export function Container({ children }: Readonly<{ children: ReactNode }>) {
	const theme = useThemeTokens();

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: theme.navigation.background },
			]}
		>
			{children}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
