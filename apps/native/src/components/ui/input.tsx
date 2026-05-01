import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { typography, useThemeColors } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";

const inputVariants = cva("font-google-sans text-base text-content py-0", {
	variants: {
		variant: {
			/** Transparent bg with visible border — address/settings forms */
			outline: "h-input rounded-input border px-card",
			/** White-filled bg, pill shape — login/signup forms */
			filled: "h-input rounded-pill bg-surface px-button-x",
		},
	},
	defaultVariants: {
		variant: "outline",
	},
});

type InputProps = TextInputProps &
	VariantProps<typeof inputVariants> & {
		className?: string;
		/** When true, renders with error border */
		hasError?: boolean;
	};

const Input = React.forwardRef<TextInput, InputProps>(
	(
		{
			className,
			variant = "outline",
			hasError = false,
			placeholderTextColor,
			style,
			onFocus,
			onBlur,
			...props
		},
		ref,
	) => {
		const themeColors = useThemeColors();
		const [isFocused, setIsFocused] = React.useState(false);

		let borderClass = "";
		if (variant === "outline") {
			if (hasError) {
				borderClass = "border-danger";
			} else if (isFocused) {
				borderClass = "border-app-primary";
			} else {
				borderClass = "border-edge";
			}
		} else if (hasError) {
			borderClass = "border border-danger";
		}

		return (
			<TextInput
				ref={ref}
				className={cn(inputVariants({ variant }), borderClass, className)}
				placeholderTextColor={placeholderTextColor ?? themeColors.textMuted}
				style={[typography.input, style]}
				onFocus={(e) => {
					setIsFocused(true);
					onFocus?.(e);
				}}
				onBlur={(e) => {
					setIsFocused(false);
					onBlur?.(e);
				}}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export type { InputProps };
export { Input, inputVariants };
