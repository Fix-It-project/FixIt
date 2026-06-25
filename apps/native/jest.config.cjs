const path = require("node:path");

module.exports = {
	preset: "jest-expo",
	rootDir: path.resolve(__dirname),
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	// The first integration test pays a cold module-tree compile cost (route
	// modules + design tokens + i18n) that can exceed Jest's 5s default. Render
	// + userEvent flows are inherently slower than unit tests, so give every
	// integration test headroom rather than annotating each one individually.
	testTimeout: 60000,
	// Each integration suite compiles the full RN/expo-router module tree on its
	// first test. Running many suites in parallel makes those cold compiles
	// contend for CPU and blow the per-test timeout. Cap workers so cold starts
	// stay bounded; the on-disk transform cache keeps warm runs fast.
	maxWorkers: 2,
	moduleNameMapper: {
		// `.svg` must precede the `^@/` alias: SVG assets are imported through the
		// alias (e.g. `@/src/assets/...svg`) and would otherwise resolve to a raw
		// XML file Jest can't transform. First matching key wins.
		"\\.svg$": "<rootDir>/test/mocks/svg-mock.js",
		"^@/(.*)$": "<rootDir>/$1",
		"^react-native-reanimated/mock$":
			"<rootDir>/test/mocks/react-native-reanimated.js",
		"^react-native-reanimated$":
			"<rootDir>/test/mocks/react-native-reanimated.js",
	},
	testMatch: [
		"<rootDir>/src/features/**/__tests__/integration/**/*.test.ts?(x)",
	],
	transformIgnorePatterns: [
		"node_modules/.pnpm/(?!(jest-)?react-native|@react-native(?:-community)?\\+.*|expo.*|@expo(?:nent)?\\+.*|@expo-google-fonts\\+.*|@testing-library\\+react-native|@rn-primitives\\+.*|react-navigation|@react-navigation\\+.*|standard-navigation|@sentry\\+react-native|native-base|react-native-svg|lucide-react-native|react-native-reanimated|react-native-worklets|nativewind|react-native-css-interop|test-renderer)@",
		"node_modules/(?!\\.pnpm|((jest-)?react-native|@react-native(-community)?|expo.*|@expo(nent)?/.*|@expo-google-fonts/.*|@testing-library/react-native|@rn-primitives/.*|react-navigation|@react-navigation/.*|standard-navigation|@sentry/react-native|native-base|react-native-svg|lucide-react-native|react-native-reanimated|react-native-worklets|nativewind|react-native-css-interop|test-renderer)/)",
	],
};
