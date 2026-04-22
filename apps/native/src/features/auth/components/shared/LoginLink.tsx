import { type Href, router } from "expo-router";
import { Pressable, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/routes";

interface LoginLinkProps {
	readonly route?: Href;
	readonly prefixText?: string;
	readonly actionText?: string;
}

export default function LoginLink({
	route = ROUTES.auth.login,
	prefixText = "Already have an account? ",
	actionText = "Log In",
}: LoginLinkProps) {
	const goToLogin = useDebounce(() => router.push(route));

	return (
		<View className="mt-4 mb-8 flex-row items-center justify-center">
			<Text variant="bodySm" className="text-content-secondary">
				{prefixText}
			</Text>
			<Pressable onPress={goToLogin}>
				<Text variant="label" className="font-bold text-app-primary">
					{actionText}
				</Text>
			</Pressable>
		</View>
	);
}
