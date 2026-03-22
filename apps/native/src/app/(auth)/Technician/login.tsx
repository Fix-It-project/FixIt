import LoginScreen from "@/src/components/shared/auth/LoginScreen";
import { useTechnicianLoginMutation } from "@/src/hooks/auth/useTechnicianLoginMutation";

export default function Login() {
  const loginMutation = useTechnicianLoginMutation();
  return (
    <LoginScreen
      loginMutation={loginMutation}
      subtitle="Sign in to your technician account"
      forgotPasswordUserType="technician"
      signupRoute="/(auth)/role-selection"
    />
  );
}
