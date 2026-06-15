import type { ConfigContext, ExpoConfig } from "expo/config";
import primitiveColors from "./src/constants/design-tokens/themes/primitive-colors.json";

type Hsl = readonly [number, number, number];

function hslToRgb([h, s, l]: Hsl): [number, number, number] {
	const sN = s / 100;
	const lN = l / 100;
	const c = (1 - Math.abs(2 * lN - 1)) * sN;
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
	const m = lN - c / 2;
	let r = 0;
	let g = 0;
	let b = 0;
	if (h < 60) [r, g, b] = [c, x, 0];
	else if (h < 120) [r, g, b] = [x, c, 0];
	else if (h < 180) [r, g, b] = [0, c, x];
	else if (h < 240) [r, g, b] = [0, x, c];
	else if (h < 300) [r, g, b] = [x, 0, c];
	else [r, g, b] = [c, 0, x];
	return [
		Math.round((r + m) * 255),
		Math.round((g + m) * 255),
		Math.round((b + m) * 255),
	];
}

function hex(t: Hsl): string {
	const [r, g, b] = hslToRgb(t);
	const h = (n: number) => n.toString(16).padStart(2, "0");
	return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

const blue = primitiveColors.blue as unknown as Record<number, Hsl>;
const NATIVE_LIGHT_PRIMARY = hex(blue[600]);
const NATIVE_DARK_PRIMARY = hex(blue[500]);

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: "FixIt",
	slug: "fixit",
	version: "0.0.0",
	orientation: "portrait",
	icon: "./src/assets/images/fixit.png",
	scheme: "fixitapp",
	userInterfaceStyle: "automatic",
	ios: {
		supportsTablet: true,
		bundleIdentifier: "com.anonymous.fixitapp",
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
		},
	},
	android: {
		adaptiveIcon: {
			backgroundColor: NATIVE_LIGHT_PRIMARY,
			foregroundImage: "./src/assets/images/android-adaptive-icon.png",
		},
		predictiveBackGestureEnabled: false,
		package: "com.anonymous.fixitapp",
		googleServicesFile: "./google-services.json",
		permissions: [
			"android.permission.ACCESS_COARSE_LOCATION",
			"android.permission.ACCESS_FINE_LOCATION",
			"android.permission.POST_NOTIFICATIONS",
			"android.permission.RECORD_AUDIO",
		],
	},
	web: {
		output: "static",
		favicon: "./src/assets/images/favicon.png",
		bundler: "metro",
	},
	plugins: [
		"expo-router",
		[
			"expo-notifications",
			{
				icon: "./src/assets/images/notification-icon.png",
				color: NATIVE_LIGHT_PRIMARY,
				defaultChannel: "fixit-alerts-v2",
			},
		],
		[
			"expo-splash-screen",
			{
				image: "./src/assets/images/splash-logo.png",
				imageWidth: 250,
				resizeMode: "contain",
				backgroundColor: NATIVE_LIGHT_PRIMARY,
				dark: {
					backgroundColor: NATIVE_DARK_PRIMARY,
				},
			},
		],
		[
			"@sentry/react-native/expo",
			{
				url: "https://sentry.io/",
				project: "react-native",
				organization: "zewail-city-of-science-and-tec",
			},
		],
		[
			"expo-location",
			{
				locationAlwaysAndWhenInUsePermission:
					"FixIt needs your location to connect you with nearby technicians.",
				locationAlwaysPermission:
					"FixIt needs your location to connect you with nearby technicians.",
				locationWhenInUsePermission:
					"FixIt needs your location to connect you with nearby technicians.",
			},
		],
		[
			"react-native-maps",
			{
				androidGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
				iosGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
			},
		],
		"expo-font",
		"expo-audio",
		"expo-web-browser",
		"expo-asset",
		"expo-image",
		"expo-secure-store",
		"expo-localization",
		"@sentry/react-native",
	],
	experiments: {
		typedRoutes: true,
		reactCompiler: true,
	},
	extra: {
		router: {},
		eas: {
			projectId: "bac43c87-2b51-4268-8876-87395dd3dbca",
		},
	},
	owner: "meryamrs-organization",
});
