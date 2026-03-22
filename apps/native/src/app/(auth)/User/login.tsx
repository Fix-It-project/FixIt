import LoginScreen from "@/src/components/shared/auth/LoginScreen";
import { useLoginMutation } from "@/src/hooks/auth/useLoginMutation";

export default function Login() {
  const loginMutation = useLoginMutation();
  return (
    <LoginScreen
      loginMutation={loginMutation}
      subtitle="Sign in to book your next repair"
      forgotPasswordUserType="user"
      showOAuth
      signupRoute="/(auth)/role-selection"
    />
  );
}
