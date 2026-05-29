export { borderWidth } from "./core/border";
export type { BorderWidth } from "./core/border";
export { elevation, shadowStyle } from "./core/elevation";
export type { ElevationTier } from "./core/elevation";
export { fontFamily } from "./core/fonts";
export type { FontFamilyToken } from "./core/fonts";
export { radius } from "./core/radius";
export type { Radius } from "./core/radius";
export { space, spacing } from "./core/spacing";
export type { SpacePrimitive, Spacing } from "./core/spacing";
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
} from "./core/tailwind";
export {
	fontAssets,
	fontSize,
	lineHeight,
	typography,
} from "./core/typography";
export type { TypographyVariant } from "./core/typography";

// Themes (theme registry, runtime, resolution, colors proxy)
export * from "./themes";
