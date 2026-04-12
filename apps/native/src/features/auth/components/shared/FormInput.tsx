import { View, Text, Pressable, type TextInputProps } from "react-native";
import { CircleX, type LucideIcon } from "lucide-react-native";
import { Colors } from "@/src/lib/theme";
import { Input } from "@/src/components/ui/input";

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
	/** Show red asterisk next to label */
	required?: boolean;
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
	required = false,
}: FormInputProps) {
	return (
		<View className={variant === "filled" ? "gap-3" : ""}>
			{label && (
				<Text className="text-[14px] font-semibold text-content">
					{label}
					{required && <Text className="text-red-500"> *</Text>}
				</Text>
			)}
			<View className="flex-row items-center">
				<Input
					variant={variant}
					hasError={!!error}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					editable={!disabled}
					className="flex-1"
				/>
				{clearable && value.length > 0 && (
					<Pressable
						onPress={onClear}
						hitSlop={8}
						className="absolute right-4 active:opacity-70"
					>
						<CircleX size={20} color={Colors.textMuted} />
					</Pressable>
				)}
				{Icon && !clearable && (
					<View className="absolute right-4">
						<Icon size={20} color={Colors.textMuted} />
					</View>
				)}
			</View>
			{error && (
				<Text
					className={
						variant === "filled"
							? "ml-4 text-[12px] text-red-500"
							: "ml-2 mt-1 text-[12px] text-red-500"
					}
				>
					{error}
				</Text>
			)}
		</View>
	);
}
