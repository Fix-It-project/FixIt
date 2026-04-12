import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useCallback, useEffect } from "react";

const RESET_PASSWORD_ROUTE = "/(auth)/(forgotpassword)/reset-password" as const;

export function useRecoveryDeepLink() {
  const handleRecoveryLink = useCallback((url: string) => {
    if (!url) {
      return;
    }

    const hashIndex = url.indexOf("#");
    if (hashIndex === -1) {
      return;
    }

    const fragment = url.substring(hashIndex + 1);
    const params = new URLSearchParams(fragment);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");

    if (type !== "recovery" || !accessToken || !refreshToken) {
      return;
    }

    router.replace({
      pathname: RESET_PASSWORD_ROUTE,
      params: {
        access_token: accessToken,
        refresh_token: refreshToken,
        userType: "user",
      },
    });
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleRecoveryLink(url);
      }
    });

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleRecoveryLink(url);
    });

    return () => subscription.remove();
  }, [handleRecoveryLink]);
}
