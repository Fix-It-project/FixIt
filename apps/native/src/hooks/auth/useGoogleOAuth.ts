import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/src/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export function useGoogleOAuth() {
  const signInWithGoogle = async () => {
    const redirectUrl = Linking.createURL("/");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) return;

    await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  };

  return { signInWithGoogle };
}
