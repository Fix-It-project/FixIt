// Jest can't parse raw .svg files as JS. react-native-svg-transformer turns
// them into components at runtime; under Jest we just need a render-safe stub
// so screens that import illustrations (role-selection, onboarding, offers…)
// mount without a transformer. Forwards props/testID to a plain View.
const React = require("react");
const { View } = require("react-native");

const SvgMock = React.forwardRef((props, ref) =>
	React.createElement(View, { ...props, ref }),
);
SvgMock.displayName = "SvgMock";

module.exports = {
	__esModule: true,
	default: SvgMock,
	ReactComponent: SvgMock,
};
