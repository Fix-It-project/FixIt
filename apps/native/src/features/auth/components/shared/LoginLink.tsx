import { type Href, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { useDebounce } from "@/src/hooks/useDebounce";
import { ROUTES } from "@/src/lib/navigation";

interface LoginLinkProps {
	readonly route?: Href;
	readonly prefixText?: string;
	readonly actionText?: string;
}

export default function LoginLink({
	route = ROUTES.auth.login,
	prefixText,
	actionText,
}: LoginLinkProps) {
	const { t } = useTranslation("auth");
	const goToLogin = useDebounce(() => router.push(route));

	return (
		<View className="mt-stack-lg mb-stack-2xl flex-row items-center justify-center">
			<Text variant="bodySm" className="text-content-secondary">
				{prefixText ?? t("login.loginLinkPrefix")}
			</Text>
			<Button variant="link" size="sm" onPress={goToLogin}>
				{actionText ?? t("login.loginLinkAction")}
			</Button>
		</View>
	);
}
