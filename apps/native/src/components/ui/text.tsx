import { Slot } from "@rn-primitives/slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import {
	I18nManager,
	Platform,
	Text as RNText,
	type Role,
	type TextStyle,
} from "react-native";
import {
	arabicFamilyByLatin,
	fontFamily,
	type TypographyVariant,
	typography,
} from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";
import { usePrefsStore } from "@/src/stores/prefs-store";

const textVariants = cva(
	cn(
		"text-base text-content",
		Platform.select({
			web: "select-text",
		}),
	),
	{
		variants: {
			variant: {
				default: "",
				display: "text-4xl",
				h1: "text-3xl",
				h2: "text-2xl",
				h3: "text-xl",
				h4: "text-lg",
				bodyLg: "text-lg",
				body: "text-base",
				bodySm: "text-sm",
				label: "text-sm",
				caption: "text-xs",
				buttonLg: "text-base",
				buttonMd: "text-sm",
				p: "mt-3 leading-7 sm:mt-6",
				blockquote: "mt-4 border-l-2 pl-3 italic sm:mt-6 sm:pl-6",
				code: "relative rounded bg-surface-elevated px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm",
				lead: "text-content-muted text-xl",
				large: "font-semibold text-lg",
				small: "font-medium text-sm leading-none",
				muted: "text-content-muted text-sm",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

type TextVariantProps = VariantProps<typeof textVariants>;
type TextVariant = NonNullable<TextVariantProps["variant"]>;

const ROLE: Partial<Record<TextVariant, Role>> = {
	h1: "heading",
	h2: "heading",
	h3: "heading",
	h4: "heading",
	blockquote: Platform.select({ web: "blockquote" as Role }),
	code: Platform.select({ web: "code" as Role }),
};

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
	h1: "1",
	h2: "2",
	h3: "3",
	h4: "4",
};

const TextClassContext = React.createContext<string | undefined>(undefined);

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

const fontClassToFamily: Record<string, string> = {
	"font-google-sans-bold": fontFamily.bold,
	"font-google-sans-semibold": fontFamily.semibold,
	"font-google-sans-medium": fontFamily.medium,
	"font-google-sans": fontFamily.regular,
	"font-bold": fontFamily.bold,
	"font-semibold": fontFamily.semibold,
	"font-medium": fontFamily.medium,
	"font-normal": fontFamily.regular,
};

const fontClassNames = new Set(Object.keys(fontClassToFamily));

function removeFontClassNames(
	className: string | undefined,
): string | undefined {
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
		const family = fontClassToFamily[classes[i]];
		if (family) return family;
	}

	return undefined;
}

// In RTL (Arabic) layouts, swap each Google Sans family for its Cairo
// weight-equivalent. Direction only changes after an app reload, so reading
// I18nManager.isRTL at render is stable.
function localizeFamily<T extends string | undefined>(family: T): T {
	return I18nManager.isRTL && family
		? ((arabicFamilyByLatin[family] ?? family) as T)
		: family;
}

// In-app text scale (Display settings). Scales fontSize + lineHeight together
// so vertical rhythm is preserved. 1 = off (no allocation on the hot path).
function applyFontScale(base: TextStyle, fontScale: number): TextStyle {
	if (fontScale === 1) return base;
	return {
		...base,
		...(typeof base.fontSize === "number"
			? { fontSize: base.fontSize * fontScale }
			: {}),
		...(typeof base.lineHeight === "number"
			? { lineHeight: base.lineHeight * fontScale }
			: {}),
	};
}

type TextProps = React.ComponentProps<typeof RNText> &
	React.RefAttributes<RNText> &
	TextVariantProps & {
		asChild?: boolean;
	};

function Text({
	className,
	asChild = false,
	variant = "default",
	style,
	...props
}: TextProps) {
	const textClass = React.useContext(TextClassContext);
	const resolvedClassName = cn(textVariants({ variant }), textClass, className);
	const semanticVariant =
		variant && variant in typography
			? (variant as TypographyVariant)
			: (getTypographyVariantFromClassName(resolvedClassName) ?? "body");
	const classFontFamily = getFontFamilyFromClassName(resolvedClassName);
	const baseVariantStyle = typography[semanticVariant];
	const localizedVariantFamily = localizeFamily(baseVariantStyle.fontFamily);
	const fontScale = usePrefsStore((s) => s.fontScale);
	const scaledStyle = applyFontScale(baseVariantStyle, fontScale);
	const variantStyle: TextStyle = localizedVariantFamily
		? { ...scaledStyle, fontFamily: localizedVariantFamily }
		: scaledStyle;
	const classFontStyle = classFontFamily
		? ({
				fontFamily: localizeFamily(classFontFamily),
				fontWeight: "400",
			} satisfies TextStyle)
		: undefined;
	const nativeWindClassName = removeFontClassNames(resolvedClassName);
	const Component = asChild ? Slot : RNText;

	return (
		<Component
			className={cn("text-content", nativeWindClassName)}
			role={variant ? ROLE[variant] : undefined}
			aria-level={variant ? ARIA_LEVEL[variant] : undefined}
			style={[variantStyle, classFontStyle, style]}
			{...props}
		/>
	);
}

export type { TextProps };
export { Text, TextClassContext, textVariants };
