export type { BorderWidth } from "./primitives/border";
export { borderWidth } from "./primitives/border";
export type { ElevationTier } from "./primitives/elevation";
export { elevation, shadowStyle } from "./primitives/elevation";
export type { FontFamilyToken } from "./primitives/fonts";
export { fontFamily } from "./primitives/fonts";
export type { Radius } from "./primitives/radius";
export { radius } from "./primitives/radius";
export type { SpacePrimitive, Spacing } from "./primitives/spacing";
export { space, spacing } from "./primitives/spacing";
export {
	tailwindBorderRadius,
	tailwindBorderWidth,
	tailwindFontFamily,
	tailwindGap,
	tailwindHeight,
	tailwindMinHeight,
	tailwindPadding,
	tailwindSpacing,
	tailwindWidth,
} from "./primitives/tailwind";
export type { TypographyVariant } from "./primitives/typography";
export {
	fontAssets,
	fontSize,
	lineHeight,
	typography,
} from "./primitives/typography";

// Themes (theme registry, runtime, resolution, colors proxy)
export * from "./themes";
