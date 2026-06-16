import { View } from "react-native";
import { GoogleIcon } from "@/src/components/icons/GoogleIcon";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useGoogleAuthFlow } from "@/src/features/auth/hooks/useGoogleAuthFlow";

export default function OAuthDivider() {
	const { startGoogleSignIn, isPending } = useGoogleAuthFlow();

	return (
		<>
			<View className="my-stack-sm flex-row items-center">
				<View className="h-[1px] flex-1 bg-edge" />
				<Text variant="caption" className="px-card text-content-muted">
					Or continue with
				</Text>
				<View className="h-[1px] flex-1 bg-edge" />
			</View>
			<Button
				variant="outline"
				size="lg"
				fullWidth
				iconLeft={<GoogleIcon />}
				onPress={startGoogleSignIn}
				disabled={isPending}
			>
				Continue with Google
			</Button>
		</>
	);
}
