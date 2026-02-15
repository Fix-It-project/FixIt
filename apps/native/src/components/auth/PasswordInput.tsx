import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PasswordInputProps {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
}

export default function PasswordInput({
	label,
	value,
	onChangeText,
	placeholder = "Enter your password",
	error,
	disabled,
}: PasswordInputProps) {
	const [visible, setVisible] = useState(false);

	return (
		<View className="gap-3">
			<Text className="text-[14px] font-semibold text-[#141118]">{label}</Text>
			<View
				className={`bg-white h-14 rounded-full flex-row items-center px-6 ${error ? "border border-red-400" : ""}`}
			>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor="#99a1af"
					secureTextEntry={!visible}
					editable={!disabled}
					className="flex-1 text-[16px] text-[#141118]"
				/>
				<Pressable onPress={() => setVisible((v) => !v)}>
					<Ionicons
						name={visible ? "eye-outline" : "eye-off-outline"}
						size={20}
						color="#99a1af"
					/>
				</Pressable>
			</View>
			{error && (
				<Text className="text-red-500 text-[12px] ml-4">{error}</Text>
			)}
		</View>
	);
}
