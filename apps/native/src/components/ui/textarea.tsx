import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Platform, TextInput, type TextInputProps } from "react-native";
import { typography, useThemeColors } from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

const textareaVariants = cva(
	"flex min-h-24 w-full min-w-0 rounded-input px-card py-3 font-google-sans text-base text-content leading-5",
	{
		variants: {
			variant: {
				outline: "border bg-transparent",
				filled: "bg-surface",
			},
		},
		defaultVariants: {
			variant: "outline",
		},
	},
);

type TextareaProps = TextInputProps &
	React.RefAttributes<TextInput> &
	VariantProps<typeof textareaVariants> & {
		className?: string;
		hasError?: boolean;
	};

const Textarea = React.forwardRef<TextInput, TextareaProps>(
	(
		{
			className,
			variant = "outline",
			hasError = false,
			multiline = true,
			numberOfLines = Platform.select({ web: 3, native: 4 }),
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
		// Android duplicates typed characters when a multiline TextInput also
		// receives `numberOfLines` (RN long-standing bug). Drop it there and let
		// the min-height utility class size the field instead.
		const resolvedNumberOfLines =
			Platform.OS === "android" && multiline ? undefined : numberOfLines;
		const borderClass =
			variant === "outline"
				? hasError
					? "border-danger"
					: isFocused
						? "border-app-primary"
						: "border-edge"
				: hasError
					? "border border-danger"
					: "";

		return (
			<TextInput
				ref={ref}
				className={cn(
					textareaVariants({ variant }),
					borderClass,
					Platform.select({
						web: cn(
							"outline-none transition-[color,box-shadow] selection:bg-app-primary selection:text-surface-on-primary",
							"focus-visible:border-app-primary focus-visible:ring-[3px] focus-visible:ring-app-primary/30",
							"aria-invalid:border-danger aria-invalid:ring-danger/20",
						),
					}),
					className,
				)}
				placeholderTextColor={placeholderTextColor ?? themeColors.textMuted}
				style={[typography.input, { textAlignVertical: "top" }, style]}
				multiline={multiline}
				numberOfLines={resolvedNumberOfLines}
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
Textarea.displayName = "Textarea";

export type { TextareaProps };
export { Textarea, textareaVariants };
