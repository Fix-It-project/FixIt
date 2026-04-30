import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Container } from "@/src/components/container";
import { Text } from "@/src/components/ui/text";
import { spacing } from "@/src/lib/design-tokens";
import { useThemeTokens } from "@/src/lib/theme";

export default function NotFoundScreen() {
	const theme = useThemeTokens();

	return (
		<>
			<Stack.Screen options={{ title: "Oops!" }} />
			<Container>
				<View style={styles.container}>
					<View style={styles.content}>
						<Text variant="display" style={styles.emoji}>
							🤔
						</Text>
						<Text
							variant="h3"
							style={[styles.title, { color: theme.navigation.text }]}
						>
							Page Not Found
						</Text>
						<Text
							variant="bodySm"
							style={[
								styles.subtitle,
								{ color: theme.navigation.text, opacity: 0.7 },
							]}
						>
							Sorry, the page you're looking for doesn't exist.
						</Text>
						<Link href="/" asChild>
							<Text
								variant="label"
								style={[
									styles.link,
									{
										color: theme.navigation.primary,
										backgroundColor: `${theme.navigation.primary}1a`,
									},
								]}
							>
								Go to Home
							</Text>
						</Link>
					</View>
				</View>
			</Container>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: spacing.card.padding,
	},
	content: {
		alignItems: "center",
	},
	emoji: {
		marginBottom: spacing.stack.lg,
	},
	title: {
		marginBottom: spacing.stack.sm,
		textAlign: "center",
	},
	subtitle: {
		textAlign: "center",
		marginBottom: spacing.stack.xl,
	},
	link: {
		padding: spacing.card.compact.padding,
	},
});
