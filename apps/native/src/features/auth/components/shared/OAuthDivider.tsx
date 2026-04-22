import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useGoogleOAuth } from "@/src/features/auth/hooks/useGoogleOAuth";
import SocialLoginButtons from "./SocialLoginButtons";

export default function OAuthDivider() {
	const { signInWithGoogle } = useGoogleOAuth();

	return (
		<>
			<View className="my-2 flex-row items-center">
				<View className="h-[1px] flex-1 bg-edge" />
				<Text variant="caption" className="px-4 text-surface-muted">
					Or continue with
				</Text>
				<View className="h-[1px] flex-1 bg-edge" />
			</View>
			<SocialLoginButtons onPress={signInWithGoogle} />
		</>
	);
}
