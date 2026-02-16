import { View, Text, TextInput, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FormInputProps {
	label: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
	icon: keyof typeof Ionicons.glyphMap;
	error?: string;
	disabled?: boolean;
	keyboardType?: TextInputProps["keyboardType"];
	autoCapitalize?: TextInputProps["autoCapitalize"];
}

export default function FormInput({
	label,
	value,
	onChangeText,
	placeholder,
	icon,
	error,
	disabled,
	keyboardType,
	autoCapitalize,
}: FormInputProps) {
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
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					editable={!disabled}
					className="flex-1 text-[16px] text-[#141118]"
				/>
				<Ionicons name={icon} size={20} color="#99a1af" />
			</View>
			{error && (
				<Text className="text-red-500 text-[12px] ml-4">{error}</Text>
			)}
		</View>
	);
}
