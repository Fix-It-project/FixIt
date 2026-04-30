import LoginScreen from "@/src/features/auth/components/shared/LoginScreen";
import { useLoginMutation } from "@/src/features/auth/hooks/useLoginMutation";
import { ROUTES } from "@/src/lib/routes";

export default function Login() {
	const loginMutation = useLoginMutation();
	return (
		<LoginScreen
			loginMutation={loginMutation}
			subtitle="Sign in to book your next repair"
			forgotPasswordUserType="user"
			showOAuth
			signupRoute={ROUTES.auth.signup}
			signupPrefixText="Don't have an account? "
			signupActionText="Sign up"
		/>
	);
}
