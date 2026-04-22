import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/lib/theme";

interface PasswordInputProps {
	readonly label?: string;
	readonly value: string;
	readonly onChangeText: (text: string) => void;
	readonly placeholder?: string;
	readonly error?: string;
	readonly disabled?: boolean;
	/** "filled" = white bg, rounded-full (login/signup). "outline" = transparent bg, rounded-2xl, border (forgot/reset). */
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
		: "mb-1 font-semibold text-content";
	const errorClassName = isFilled
		? "text-red-500 ml-4"
		: "text-red-500 ml-2 mt-1";

	let containerClass =
		"bg-surface h-14 rounded-full flex-row items-center px-6";
	if (isFilled) {
		if (error) {
			containerClass += " border border-red-400";
		}
	} else {
		let outlineBorderClass = "border-edge";
		if (error) {
			outlineBorderClass = "border-red-400";
		} else if (hasValue) {
			outlineBorderClass = "border-app-primary";
		}
		containerClass = `h-14 rounded-2xl flex-row items-center px-5 border ${outlineBorderClass}`;
	}

	return (
		<View className={isFilled ? "gap-3" : ""}>
			{label && (
				<Text variant="label" className={labelClassName}>
					{label}
					{required && (
						<Text variant="label" className="text-red-500">
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
					className="flex-1 text-base text-content"
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
