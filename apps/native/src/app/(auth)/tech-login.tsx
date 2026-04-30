import LoginScreen from "@/src/features/auth/components/shared/LoginScreen";
import { useTechnicianLoginMutation } from "@/src/features/auth/hooks/useTechnicianLoginMutation";
import { ROUTES } from "@/src/lib/routes";

export default function TechLogin() {
	const loginMutation = useTechnicianLoginMutation();
	return (
		<LoginScreen
			loginMutation={loginMutation}
			subtitle="Sign in to your technician account"
			forgotPasswordUserType="technician"
			signupRoute={ROUTES.auth.techSignup}
			signupPrefixText="Not a Technician yet? "
			signupActionText="Apply now!"
		/>
	);
}
