import * as React from "react";
import { Text as RNText, type TextProps, type TextStyle } from "react-native";
import {
	fontFamily,
	type TypographyVariant,
	typography,
} from "@/src/lib/design-tokens";
import { cn } from "@/src/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

interface AppTextProps extends TextProps {
	/**
	 * Semantic typography variant. Bundles fontSize + lineHeight + fontFamily.
	 * Omit to use the default body variant, so Google Sans is still applied.
	 */
	readonly variant?: TypographyVariant;
}

const textSizeClassToVariant: Record<string, TypographyVariant> = {
	"text-xs": "caption",
	"text-sm": "bodySm",
	"text-base": "body",
	"text-lg": "bodyLg",
	"text-xl": "h3",
	"text-2xl": "h2",
	"text-3xl": "h1",
	"text-4xl": "display",
};

const fontClassNames = new Set([
	"font-google-sans-bold",
	"font-google-sans-semibold",
	"font-google-sans-medium",
	"font-google-sans",
	"font-bold",
	"font-semibold",
	"font-medium",
	"font-normal",
]);

function removeFontClassNames(className: string | undefined): string | undefined {
	if (!className) return undefined;
	return className
		.split(/\s+/)
		.filter((classNamePart) => !fontClassNames.has(classNamePart))
		.join(" ");
}

function getTypographyVariantFromClassName(
	className: string | undefined,
): TypographyVariant | undefined {
	if (!className) return undefined;

	const classes = className.split(/\s+/);
	for (let i = classes.length - 1; i >= 0; i -= 1) {
		const variant = textSizeClassToVariant[classes[i]];
		if (variant) return variant;
	}

	return undefined;
}

function getFontFamilyFromClassName(
	className: string | undefined,
): string | undefined {
	if (!className) return undefined;

	const classes = className.split(/\s+/);
	for (let i = classes.length - 1; i >= 0; i -= 1) {
		const classNamePart = classes[i];
		if (classNamePart === "font-google-sans-bold") return fontFamily.bold;
		if (classNamePart === "font-google-sans-semibold") {
			return fontFamily.semibold;
		}
		if (classNamePart === "font-google-sans-medium") return fontFamily.medium;
		if (classNamePart === "font-google-sans") return fontFamily.regular;
		if (classNamePart === "font-bold") return fontFamily.bold;
		if (classNamePart === "font-semibold") return fontFamily.semibold;
		if (classNamePart === "font-medium") return fontFamily.medium;
		if (classNamePart === "font-normal") return fontFamily.regular;
	}

	return undefined;
}

const Text = React.forwardRef<RNText, AppTextProps>(
	({ className, variant, style, ...props }, ref) => {
		const textClass = React.useContext(TextClassContext);
		const resolvedClassName = cn(textClass, className);
		const resolvedVariant =
			variant ?? getTypographyVariantFromClassName(resolvedClassName) ?? "body";
		const classFontFamily = getFontFamilyFromClassName(resolvedClassName);
		const variantStyle = typography[resolvedVariant];
		const classFontStyle = classFontFamily
			? ({ fontFamily: classFontFamily, fontWeight: "400" } satisfies TextStyle)
			: undefined;
		const nativeWindClassName = removeFontClassNames(resolvedClassName);

		return (
			<RNText
				className={cn("text-base text-foreground", nativeWindClassName)}
				ref={ref}
				style={[variantStyle, classFontStyle, style]}
				{...props}
			/>
		);
	},
);
Text.displayName = "Text";

export type { AppTextProps };
export { Text, TextClassContext };
