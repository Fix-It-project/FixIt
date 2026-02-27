import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface PasswordInputProps {
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	/** "filled" = white bg, rounded-full (login/signup). "outline" = transparent bg, rounded-2xl, border (forgot/reset). */
	variant?: "filled" | "outline";
}

export default function PasswordInput({
	label,
	value,
	onChangeText,
	placeholder = "Enter your password",
	error,
	disabled,
	variant = "filled",
}: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	const isFilled = variant === "filled";

	const containerClass = isFilled
		? `bg-white h-14 rounded-full flex-row items-center px-6 ${error ? "border border-red-400" : ""}`
		: `h-14 rounded-2xl flex-row items-center px-5 border ${
				error
					? "border-red-400"
					: value.length > 0
						? "border-[#036ded]"
						: "border-[#c4c0cc]"
			}`;

	return (
		<View className={isFilled ? "gap-3" : ""}>
			{label && (
				<Text
					className={
						isFilled
							? "font-semibold text-[14px] text-[#141118]"
							: "mb-1 font-semibold text-[14px] text-[#141118]"
					}
				>
					{label}
				</Text>
			)}
			<View className={containerClass}>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor="#99a1af"
					secureTextEntry={!visible}
					editable={!disabled}
					className="flex-1 text-[16px] text-[#141118]"
				/>
				<Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
					{visible ? (
						<Eye size={20} color="#99a1af" />
					) : (
						<EyeOff size={20} color="#99a1af" />
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
