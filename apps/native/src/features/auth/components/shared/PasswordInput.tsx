import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useThemeColors } from "@/src/lib/theme";

interface PasswordInputProps {
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	/** "filled" = white bg, rounded-full (login/signup). "outline" = transparent bg, rounded-2xl, border (forgot/reset). */
	variant?: "filled" | "outline";
	/** Show red asterisk next to label */
	required?: boolean;
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

	const containerClass = isFilled
		? `bg-surface h-14 rounded-full flex-row items-center px-6 ${error ? "border border-red-400" : ""}`
		: `h-14 rounded-2xl flex-row items-center px-5 border ${
				error
					? "border-red-400"
					: value.length > 0
						? "border-app-primary"
						: "border-edge"
			}`;

	return (
		<View className={isFilled ? "gap-3" : ""}>
			{label && (
				<Text
					className={
						isFilled
							? "font-semibold text-[14px] text-content"
							: "mb-1 font-semibold text-[14px] text-content"
					}
				>
					{label}
					{required && <Text className="text-red-500"> *</Text>}
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
					className="flex-1 text-[16px] text-content"
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
				<Text
					className={
						isFilled
							? "text-red-500 text-[12px] ml-4"
							: "text-red-500 text-[12px] ml-2 mt-1"
					}
				>
					{error}
				</Text>
			)}
		</View>
	);
}