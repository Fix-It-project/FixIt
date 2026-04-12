import LoginScreen from "@/src/features/auth/components/shared/LoginScreen";
import { useLoginMutation } from "@/src/hooks/auth/useLoginMutation";

export default function Login() {
  const loginMutation = useLoginMutation();
  return (
    <LoginScreen
      loginMutation={loginMutation}
      subtitle="Sign in to book your next repair"
      forgotPasswordUserType="user"
      showOAuth
      signupRoute="/(auth)/User/signup"
      signupPrefixText="Don't have an account? "
      signupActionText="Sign up"
    />
  );
}
