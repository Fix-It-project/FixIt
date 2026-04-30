import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { typography, useThemeColors } from "@/src/lib/theme";

interface PasswordInputProps {
	readonly label?: string;
	readonly value: string;
	readonly onChangeText: (text: string) => void;
	readonly placeholder?: string;
	readonly error?: string;
	readonly disabled?: boolean;
	/** "filled" = white bg, rounded-pill (login/signup). "outline" = transparent bg, rounded-card, border (forgot/reset). */
	readonly variant?: "filled" | "outline";
	/** Show red asterisk next to label */
	readonly required?: boolean;
}

export default function PasswordInput({
	label,
	value,
	onChangeText,
	placeholder = "Enter your password",
	error,
	disabled,
	variant = "filled",
	required = false,
}: PasswordInputProps) {
	const themeColors = useThemeColors();
	const [visible, setVisible] = useState(false);

	const isFilled = variant === "filled";
	const hasValue = value.length > 0;
	const labelClassName = isFilled
		? "font-semibold text-content"
		: "mb-stack-xs font-semibold text-content";
	const errorClassName = isFilled
		? "text-danger ml-card"
		: "text-danger ml-stack-sm mt-stack-xs";

	let containerClass =
		"bg-surface h-input rounded-pill flex-row items-center px-button-x";
	if (isFilled) {
		if (error) {
			containerClass += " border border-danger";
		}
	} else {
		let outlineBorderClass = "border-edge";
		if (error) {
			outlineBorderClass = "border-danger";
		} else if (hasValue) {
			outlineBorderClass = "border-app-primary";
		}
		containerClass = `h-input rounded-input flex-row items-center px-card-roomy border ${outlineBorderClass}`;
	}

	return (
		<View className={isFilled ? "gap-stack-md" : ""}>
			{label && (
				<Text variant="label" className={labelClassName}>
					{label}
					{required && (
						<Text variant="label" className="text-danger">
							{" "}
							*
						</Text>
					)}
				</Text>
			)}
			<View className={containerClass}>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={themeColors.textMuted}
					secureTextEntry={!visible}
					editable={!disabled}
					className="flex-1 p-0 text-content"
					style={typography.input}
				/>
				<Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
					{visible ? (
						<Eye size={20} color={themeColors.textMuted} />
					) : (
						<EyeOff size={20} color={themeColors.textMuted} />
					)}
				</Pressable>
			</View>
			{error && (
				<Text variant="caption" className={errorClassName}>
					{error}
				</Text>
			)}
		</View>
	);
}
