import { Linking, Platform } from "react-native";

const IOS_MAIL_URLS = ["googlegmail://", "ms-outlook://", "message://"];

const ANDROID_MAIL_URLS = ["googlegmail://", "message://", "ms-outlook://"];

export async function openMailApp(): Promise<void> {
	const candidateUrls =
		Platform.OS === "ios" ? IOS_MAIL_URLS : ANDROID_MAIL_URLS;

	for (const url of candidateUrls) {
		try {
			if (await Linking.canOpenURL(url)) {
				await Linking.openURL(url);
				return;
			}
		} catch {
			// Try the next candidate before falling back to a generic mailto launch.
		}
	}

	await Linking.openURL("mailto:");
}
