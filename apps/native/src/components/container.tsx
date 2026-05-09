import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";

import { useThemeTokens } from "@/src/lib/theme";

export function Container({ children }: Readonly<{ children: ReactNode }>) {
	const theme = useThemeTokens();

	return (
		<ScreenSafeAreaView
			style={[
				styles.container,
				{ backgroundColor: theme.navigation.background },
			]}
		>
			{children}
		</ScreenSafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
