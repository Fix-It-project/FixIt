import { GoogleSignin } from "@react-native-google-signin/google-signin";

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

if (!webClientId) {
	throw new Error("Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID");
}

GoogleSignin.configure({
	webClientId,
	...(iosClientId ? { iosClientId } : {}),
});
