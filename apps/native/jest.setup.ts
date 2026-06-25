process.env.EXPO_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = "test-google-client-id";

jest.doMock("@FixIt/env/native", () => ({
	env: {
		EXPO_PUBLIC_LOCIZE_API_KEY: "",
		EXPO_PUBLIC_LOCIZE_PROJECT_ID: "",
		EXPO_PUBLIC_SERVER_URL: "https://api.test.local",
		EXPO_PUBLIC_SENTRY_DSN: "",
	},
}));

jest.doMock("@/src/config/monitoring", () => ({
	Sentry: {
		metrics: {
			count: jest.fn(),
			distribution: jest.fn(),
			gauge: jest.fn(),
		},
	},
	clearUser: jest.fn(),
	registerNavigationContainer: jest.fn(),
	setFeatureContext: jest.fn(),
	setUser: jest.fn(),
}));

jest.doMock("@/src/config/supabase", () => ({
	supabase: {
		auth: {
			getSession: jest.fn(async () => ({ data: { session: null } })),
			onAuthStateChange: jest.fn(() => ({
				data: { subscription: { unsubscribe: jest.fn() } },
			})),
			refreshSession: jest.fn(async () => ({ data: {}, error: null })),
			setSession: jest.fn(async () => ({ data: {}, error: null })),
			signInWithIdToken: jest.fn(),
			signOut: jest.fn(async () => ({ error: null })),
		},
		realtime: {
			setAuth: jest.fn(),
		},
	},
}));

jest.doMock("@react-native-async-storage/async-storage", () =>
	require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.doMock("expo-secure-store", () => ({
	deleteItemAsync: jest.fn(async () => undefined),
	getItemAsync: jest.fn(async () => null),
	setItemAsync: jest.fn(async () => undefined),
}));

jest.doMock("@react-native-google-signin/google-signin", () => ({
	GoogleSignin: {
		configure: jest.fn(),
		hasPlayServices: jest.fn(),
		signIn: jest.fn(),
		signOut: jest.fn(),
	},
	isErrorWithCode: jest.fn(() => false),
	isSuccessResponse: jest.fn(() => false),
	statusCodes: {
		SIGN_IN_CANCELLED: "SIGN_IN_CANCELLED",
	},
}));

jest.doMock("react-native-toast-message", () => ({
	__esModule: true,
	default: {
		hide: jest.fn(),
		show: jest.fn(),
	},
}));

jest.doMock("react-native-keyboard-controller", () => {
	const React = require("react");
	const { View } = require("react-native");

	return {
		KeyboardAvoidingView: ({ children, ...props }: { children?: unknown }) =>
			React.createElement(View, props, children),
	};
});

jest.doMock("react-native-safe-area-context", () => {
	const React = require("react");
	const { View } = require("react-native");

	return {
		SafeAreaProvider: ({ children }: { children?: unknown }) => children,
		SafeAreaView: ({ children, ...props }: { children?: unknown }) =>
			React.createElement(View, props, children),
		useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
	};
});

require("@/src/config/i18n");
