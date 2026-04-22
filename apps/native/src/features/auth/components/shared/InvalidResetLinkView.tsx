import { type Href, router } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "@/src/components/ui/BackButton";
import { Button } from "@/src/components/ui/button";
import { Text as BtnText, Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface InvalidResetLinkViewProps {
	readonly loginRoute: Href;
}

export default function InvalidResetLinkView({
	loginRoute,
}: InvalidResetLinkViewProps) {
	const insets = useSafeAreaInsets();
	return (
		<View className="flex-1 bg-app-primary-light">
			{/* Top Bar */}
			<View
				className="flex-row items-center px-4 pb-2"
				style={{ paddingTop: insets.top + 8 }}
			>
				<BackButton variant="header" size="md" />
			</View>

			{/* Header */}
			<View className="mt-2 mb-6 px-screen-x">
				<Text variant="h2" className="mb-2 text-content">
					Invalid Link
				</Text>
				<Text variant="body" className="text-content-secondary">
					This password reset link is invalid or has expired
				</Text>
			</View>

			{/* Icon */}
			<View className="mt-6 items-center">
				<View className="h-20 w-20 items-center justify-center rounded-full bg-red-100">
					<AlertCircle size={40} color={Colors.danger} />
				</View>
				<Text
					variant="bodySm"
					className="mt-4 px-10 text-center text-content-secondary"
				>
					Please request a new password reset link from the login page.
				</Text>
			</View>

			{/* Spacer */}
			<View className="flex-1" />

			{/* Bottom Button */}
			<View
				className="px-screen-x"
				style={{ paddingBottom: insets.bottom + 16 }}
			>
				<Button
					variant="outline"
					onPress={() => router.replace(loginRoute)}
					className="border-2 border-app-primary"
				>
					<BtnText className="text-app-primary">Back to Login</BtnText>
				</Button>
			</View>
		</View>
	);
}
