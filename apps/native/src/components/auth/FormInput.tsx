import { View, Text, TextInput, Pressable, type TextInputProps } from "react-native";
import { CircleX, type LucideIcon } from "lucide-react-native";

interface FormInputProps {
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	placeholder: string;
	icon?: LucideIcon;
	error?: string;
	disabled?: boolean;
	keyboardType?: TextInputProps["keyboardType"];
	autoCapitalize?: TextInputProps["autoCapitalize"];
	/** "filled" = white bg, rounded-full (login/signup). "outline" = transparent bg, rounded-2xl, border (forgot/reset). */
	variant?: "filled" | "outline";
	/** Show a clear (✕) button when the field has text */
	clearable?: boolean;
	/** Called when the clear button is pressed */
	onClear?: () => void;
}

export default function FormInput({
	label,
	value,
	onChangeText,
	placeholder,
	icon: Icon,
	error,
	disabled,
	keyboardType,
	autoCapitalize,
	variant = "filled",
	clearable = false,
	onClear,
}: FormInputProps) {
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
				<Text className="text-[14px] font-semibold text-[#141118]">{label}</Text>
			)}
			<View className={containerClass}>
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
				{clearable && value.length > 0 && (
					<Pressable
						onPress={onClear}
						hitSlop={8}
						className="active:opacity-70"
					>
						<CircleX size={20} color="#99a1af" />
					</Pressable>
				)}
				{Icon && !clearable && <Icon size={20} color="#99a1af" />}
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
