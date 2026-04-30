const { withNativeWind } = require("nativewind/metro");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;

config.transformer = {
	...config.transformer,
	babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};
config.resolver.assetExts = config.resolver.assetExts.filter(
	(ext) => ext !== "svg",
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = withNativeWind(config, {
	input: "./global.css",
	configPath: "./tailwind.config.ts",
	inlineRem: 16,
});
