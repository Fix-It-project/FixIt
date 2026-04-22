import * as React from "react";
import { Text as RNText, type TextProps } from "react-native";
import { type TypographyVariant, typography } from "@/src/lib/design-tokens";
import { cn } from "@/src/lib/utils";

const TextClassContext = React.createContext<string | undefined>(undefined);

interface AppTextProps extends TextProps {
	/**
	 * Semantic typography variant. Bundles fontSize + lineHeight + fontFamily.
	 * Omit to preserve the existing default (`text-base text-foreground`) — so
	 * every pre-existing <Text> renders identically.
	 */
	readonly variant?: TypographyVariant;
}

const Text = React.forwardRef<RNText, AppTextProps>(
	({ className, variant, style, ...props }, ref) => {
		const textClass = React.useContext(TextClassContext);
		const variantStyle = variant ? typography[variant] : undefined;
		return (
			<RNText
				className={cn("text-base text-foreground", textClass, className)}
				ref={ref}
				style={variantStyle ? [variantStyle, style] : style}
				{...props}
			/>
		);
	},
);
Text.displayName = "Text";

export type { AppTextProps };
export { Text, TextClassContext };
