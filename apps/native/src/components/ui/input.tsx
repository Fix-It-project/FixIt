import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/src/lib/utils";
import { useThemeColors } from "@/src/lib/theme";

const inputVariants = cva(
	"font-normal text-base text-content",
	{
		variants: {
			variant: {
				/** Transparent bg with visible border — address/settings forms */
				outline: "h-14 rounded-2xl border px-4",
				/** White-filled bg, pill shape — login/signup forms */
				filled: "h-14 rounded-full bg-surface px-6",
			},
		},
		defaultVariants: {
			variant: "outline",
		},
	}
);

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
		ref
	) => {
		const themeColors = useThemeColors();
		const [isFocused, setIsFocused] = React.useState(false);

		/** Derive the dynamic border class for the outline variant */
		const borderClass =
			variant === "outline"
				? hasError
					? "border-red-400"
					: isFocused
						? "border-app-primary"
						: "border-edge"
				: hasError
					? "border border-red-400"
					: "";

		return (
			<TextInput
				ref={ref}
				className={cn(
					inputVariants({ variant }),
					borderClass,
					className
				)}
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
	}
);
Input.displayName = "Input";

export { Input, inputVariants };
export type { InputProps };
