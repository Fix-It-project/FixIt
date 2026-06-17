import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import LoginScreen from "@/src/features/auth/components/shared/LoginScreen";
import { useTechnicianLoginMutation } from "@/src/features/auth/hooks/useTechnicianLoginMutation";
import { ROUTES } from "@/src/lib/navigation";

export default function TechLogin() {
	const { t } = useTranslation("auth");
	const loginMutation = useTechnicianLoginMutation();
	const { email } = useLocalSearchParams<{ email?: string }>();
	return (
		<LoginScreen
			loginMutation={loginMutation}
			subtitle={t("login.techSubtitle")}
			forgotPasswordUserType="technician"
			signupRoute={ROUTES.auth.techSignup}
			signupPrefixText={t("login.techSignupPrefix")}
			signupActionText={t("login.techSignupAction")}
			initialEmail={email}
		/>
	);
}
