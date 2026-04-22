import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { useThemeColors } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";

const inputVariants = cva("font-normal text-base text-content", {
	variants: {
		variant: {
			/** Transparent bg with visible border — address/settings forms */
			outline: "h-input rounded-2xl border px-4",
			/** White-filled bg, pill shape — login/signup forms */
			filled: "h-input rounded-full bg-surface px-6",
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
				borderClass = "border-red-400";
			} else if (isFocused) {
				borderClass = "border-app-primary";
			} else {
				borderClass = "border-edge";
			}
		} else if (hasError) {
			borderClass = "border border-red-400";
		}

		return (
			<TextInput
				ref={ref}
				className={cn(inputVariants({ variant }), borderClass, className)}
				placeholderTextColor={placeholderTextColor ?? themeColors.textMuted}
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
