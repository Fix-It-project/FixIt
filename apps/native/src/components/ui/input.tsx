import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react-native";
import * as React from "react";
import { Pressable, TextInput, type TextInputProps, View } from "react-native";
import { logger } from "@/src/lib/logger";
import { typography, useThemeColors } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";

const inputVariants = cva("font-google-sans text-base text-content py-0", {
	variants: {
		variant: {
			/** Transparent bg with visible border — address/settings forms */
			outline: "rounded-input border px-card",
			/** Filled surface with the same app input radius */
			filled: "rounded-input bg-surface px-card",
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
		/** When true, expands vertically; removes fixed height */
		multiline?: boolean;
		/** When true, renders an eye/eye-off toggle for password visibility */
		secureToggle?: boolean;
	};

const Input = React.forwardRef<TextInput, InputProps>(
	(
		{
			className,
			variant = "outline",
			hasError = false,
			multiline: multilineProp,
			secureToggle,
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

		const isMultiline = multilineProp ?? false;
		const hasSecureToggle = secureToggle ?? false;

		if (__DEV__ && hasSecureToggle && isMultiline) {
			logger.warn(
				"Input",
				"secureToggle is ignored when multiline=true — password fields are never multiline.",
			);
		}

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

		const heightClass = isMultiline ? "min-h-[48px] py-3" : "h-input";

		const resolvedStyle = [
			typography.input,
			isMultiline ? ({ textAlignVertical: "top" } as const) : undefined,
			style,
		];

		const textInput = (
			<TextInput
				ref={ref}
				className={cn(
					inputVariants({ variant }),
					heightClass,
					borderClass,
					hasSecureToggle && !isMultiline ? "flex-1" : undefined,
					className,
				)}
				placeholderTextColor={placeholderTextColor ?? themeColors.textMuted}
				style={resolvedStyle}
				multiline={isMultiline}
				secureTextEntry={hasSecureToggle && !isMultiline ? !secureVisible : undefined}
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

		if (hasSecureToggle && !isMultiline) {
			const IconComponent = secureVisible ? Eye : EyeOff;
			return (
				<View className="flex-row items-center">
					{textInput}
					<Pressable
						onPress={() => setSecureVisible((v) => !v)}
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
