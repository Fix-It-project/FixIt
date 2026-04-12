import { StyleSheet, Text, View } from "react-native";

import { Container } from "@/src/components/container";
import { useThemeTokens } from "@/src/lib/theme";

export default function Modal() {
	const theme = useThemeTokens();

	return (
		<Container>
			<View style={styles.container}>
				<View style={styles.header}>
					<Text style={[styles.title, { color: theme.navigation.text }]}>
						Modal
					</Text>
				</View>
			</View>
		</Container>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		marginBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
});
