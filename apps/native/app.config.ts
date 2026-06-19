import type { ConfigContext, ExpoConfig } from "expo/config";
import rootPackageJson from "../../package.json";
import primitiveColors from "./src/constants/design-tokens/themes/primitive-colors.json";

type Hsl = readonly [number, number, number];
type ExpoPlugin = NonNullable<ExpoConfig["plugins"]>[number];

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
const EAS_PROJECT_ID = "12a8c718-708c-4460-9e12-8d356b933b74";
const GOOGLE_IOS_CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";

// Per-variant identity so an EAS `development` build (env APP_VARIANT) installs
// alongside the preview/production app instead of overwriting it. preview +
// production keep the base id (don't break existing installs / OTA channels).
const IS_DEV_VARIANT = process.env.APP_VARIANT === "development";
const BASE_BUNDLE_ID = "com.anonymous.fixitapp";
const BUNDLE_ID = IS_DEV_VARIANT ? `${BASE_BUNDLE_ID}.dev` : BASE_BUNDLE_ID;
const APP_NAME = IS_DEV_VARIANT ? "FixIt Dev" : "FixIt";
// App version tracks the root "fixit" release (the Latest GitHub release the
// APK is attached to), not the per-package native version.
const APP_VERSION = rootPackageJson.version;

function googleIosUrlScheme(clientId: string | undefined): string | undefined {
	if (!clientId) return undefined;
	if (!clientId.endsWith(GOOGLE_IOS_CLIENT_ID_SUFFIX)) return clientId;

	return `com.googleusercontent.apps.${clientId.slice(
		0,
		-GOOGLE_IOS_CLIENT_ID_SUFFIX.length,
	)}`;
}

const googleIosScheme = googleIosUrlScheme(
	process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
);
const googleSignInPlugin: ExpoPlugin = googleIosScheme
	? [
			"@react-native-google-signin/google-signin",
			{
				iosUrlScheme: googleIosScheme,
			},
		]
	: "@react-native-google-signin/google-signin";

export default ({ config }: ConfigContext): ExpoConfig => ({
	...config,
	name: APP_NAME,
	slug: "fixit",
	version: APP_VERSION,
	orientation: "portrait",
	icon: "./src/assets/images/fixit.png",
	scheme: "fixitapp",
	userInterfaceStyle: "automatic",
	updates: {
		url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
	},
	runtimeVersion: {
		policy: "fingerprint",
	},
	ios: {
		supportsTablet: true,
		bundleIdentifier: BUNDLE_ID,
		infoPlist: {
			ITSAppUsesNonExemptEncryption: false,
			// Technician background location tracking continues while suspended.
			UIBackgroundModes: ["location"],
		},
	},
	android: {
		adaptiveIcon: {
			backgroundColor: NATIVE_LIGHT_PRIMARY,
			foregroundImage: "./src/assets/images/android-adaptive-icon.png",
		},
		predictiveBackGestureEnabled: false,
		package: BUNDLE_ID,
		googleServicesFile: "./google-services.json",
		permissions: [
			"android.permission.ACCESS_COARSE_LOCATION",
			"android.permission.ACCESS_FINE_LOCATION",
			// Technician background location tracking (foreground service).
			"android.permission.ACCESS_BACKGROUND_LOCATION",
			"android.permission.FOREGROUND_SERVICE",
			"android.permission.FOREGROUND_SERVICE_LOCATION",
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
				// Technician live tracking runs as an Android foreground service and
				// keeps streaming in the background until arrival.
				isAndroidForegroundServiceEnabled: true,
				isAndroidBackgroundLocationEnabled: true,
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
		googleSignInPlugin,
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
			projectId: EAS_PROJECT_ID,
		},
	},
	owner: "amrmamdouhs-organization",
});
