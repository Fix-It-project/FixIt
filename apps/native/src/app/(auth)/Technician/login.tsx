import LoginScreen from "@/src/features/auth/components/shared/LoginScreen";
import { useTechnicianLoginMutation } from "@/src/hooks/auth/useTechnicianLoginMutation";

export default function Login() {
  const loginMutation = useTechnicianLoginMutation();
  return (
    <LoginScreen
      loginMutation={loginMutation}
      subtitle="Sign in to your technician account"
      forgotPasswordUserType="technician"
      signupRoute="/(auth)/Technician/signup"
      signupPrefixText="Not a Technician yet? "
      signupActionText="Apply now!"
    />
  );
}
