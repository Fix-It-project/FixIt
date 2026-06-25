import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import {
	Platform,
	Pressable,
	TextInput,
	type TextInputProps,
	View,
} from "react-native";
import { logger } from "@/src/lib/logger";
import { typography, useThemeColors } from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

const inputVariants = cva(
	"flex w-full min-w-0 flex-row items-center rounded-input px-card py-0 font-google-sans text-base text-content leading-5",
	{
		variants: {
			variant: {
				outline: "border bg-transparent",
				filled: "bg-surface shadow-black/5 shadow-sm",
			},
		},
		defaultVariants: {
			variant: "outline",
		},
	},
);

type InputProps = TextInputProps &
	React.RefAttributes<TextInput> &
	VariantProps<typeof inputVariants> & {
		className?: string;
		hasError?: boolean;
		secureToggle?: boolean;
	};

function getBorderClass(
	variant: string | null | undefined,
	hasError: boolean,
	isFocused: boolean,
): string {
	if (variant !== "outline") return hasError ? "border border-danger" : "";
	if (hasError) return "border-danger";
	if (isFocused) return "border-app-primary";
	return "border-edge";
}

const Input = React.forwardRef<TextInput, InputProps>(
	(
		{
			className,
			variant = "outline",
			hasError = false,
			multiline = false,
			secureToggle = false,
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
		const [secureVisible, setSecureVisible] = React.useState(false);
		const hasSecureToggle = secureToggle && !multiline;

		if (__DEV__ && secureToggle && multiline) {
			logger.warn(
				"Input",
				"secureToggle is ignored when multiline=true — password fields are never multiline.",
			);
		}

		const borderClass = getBorderClass(variant, hasError, isFocused);
		const heightClass = multiline ? "min-h-[48px] py-3" : "h-input";

		const textInput = (
			<TextInput
				ref={ref}
				className={cn(
					inputVariants({ variant }),
					heightClass,
					borderClass,
					Platform.select({
						web: cn(
							"outline-none transition-[color,box-shadow] selection:bg-app-primary selection:text-surface-on-primary",
							"focus-visible:border-app-primary focus-visible:ring-[3px] focus-visible:ring-app-primary/30",
							"aria-invalid:border-danger aria-invalid:ring-danger/20",
						),
					}),
					hasSecureToggle ? "flex-1" : undefined,
					className,
				)}
				placeholderTextColor={placeholderTextColor ?? themeColors.textMuted}
				style={[
					typography.input,
					multiline ? ({ textAlignVertical: "top" } as const) : undefined,
					style,
				]}
				multiline={multiline}
				secureTextEntry={hasSecureToggle ? !secureVisible : undefined}
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

		if (hasSecureToggle) {
			const IconComponent = secureVisible ? Eye : EyeOff;
			return (
				<View className="flex-row items-center">
					{textInput}
					<Pressable
						onPress={() => setSecureVisible((value) => !value)}
						hitSlop={8}
						className="absolute right-4"
					>
						<IconComponent size={20} color={themeColors.textMuted} />
					</Pressable>
				</View>
			);
		}

		return textInput;
	},
);
Input.displayName = "Input";

export type { InputProps };
export { Input, inputVariants };
