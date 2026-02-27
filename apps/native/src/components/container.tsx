import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NAV_THEME } from "@/src/lib/theme";
import { useColorScheme } from "@/src/hooks/use-color-scheme";

export function Container({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const backgroundColor =
    colorScheme === "dark" ? NAV_THEME.dark.colors.background : NAV_THEME.light.colors.background;

  return <SafeAreaView style={[styles.container, { backgroundColor }]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
