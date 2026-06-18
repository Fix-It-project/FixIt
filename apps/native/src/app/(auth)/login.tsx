import { useTranslation } from "react-i18next";
import LoginScreen from "@/src/features/auth/components/shared/LoginScreen";
import { useLoginMutation } from "@/src/features/auth/hooks/useLoginMutation";
import { ROUTES } from "@/src/lib/navigation";

export default function Login() {
	const { t } = useTranslation("auth");
	const loginMutation = useLoginMutation();
	return (
		<LoginScreen
			loginMutation={loginMutation}
			subtitle={t("login.userSubtitle")}
			forgotPasswordUserType="user"
			showOAuth
			signupRoute={ROUTES.auth.signup}
			signupPrefixText={t("login.userSignupPrefix")}
			signupActionText={t("login.userSignupAction")}
		/>
	);
}
