const { View } = require("react-native");

const identityAnimation = (value) => value;
const linearEasing = (value) => value;

const Easing = {
	bezier: () => linearEasing,
	cubic: linearEasing,
	ease: linearEasing,
	in: () => linearEasing,
	inOut: () => linearEasing,
	out: () => linearEasing,
	quad: linearEasing,
};

module.exports = {
	__esModule: true,
	default: {
		Easing,
		View,
		createAnimatedComponent: (Component) => Component,
	},
	Easing,
	useAnimatedStyle: (factory) => factory(),
	useReducedMotion: () => true,
	useSharedValue: (value) => ({ value }),
	withDelay: identityAnimation,
	withRepeat: identityAnimation,
	withSequence: (...values) => values.at(-1),
	withSpring: identityAnimation,
	withTiming: identityAnimation,
};
