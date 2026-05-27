import { CircleX, type LucideIcon } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Input, type InputProps } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import { Colors } from "@/src/lib/theme";

interface FormInputProps {
	readonly label?: string;
	readonly value: string;
	readonly onChangeText: (text: string) => void;
	readonly placeholder: string;
	readonly icon?: LucideIcon;
	readonly error?: string;
	readonly disabled?: boolean;
	readonly keyboardType?: InputProps["keyboardType"];
	readonly autoCapitalize?: InputProps["autoCapitalize"];
	readonly variant?: "filled" | "outline";
	readonly clearable?: boolean;
	readonly onClear?: () => void;
	readonly required?: boolean;
	readonly secureToggle?: boolean;
	readonly multiline?: boolean;
}

function FormInput({
	label,
	value,
	onChangeText,
	placeholder,
	icon: Icon,
	error,
	disabled,
	keyboardType,
	autoCapitalize,
	variant = "outline",
	clearable = false,
	onClear,
	required = false,
	secureToggle,
	multiline,
}: FormInputProps) {
	return (
		<View className="gap-stack-sm">
			{label && (
				<Text variant="buttonMd" className="text-content">
					{label}
					{required && (
						<Text variant="buttonMd" className="text-danger">
							{" "}
							*
						</Text>
					)}
				</Text>
			)}
			<View className="flex-row items-center">
				{multiline ? (
					<Textarea
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
				) : (
					<Input
						variant={variant}
						hasError={!!error}
						value={value}
						onChangeText={onChangeText}
						placeholder={placeholder}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
						editable={!disabled}
						secureToggle={secureToggle}
						className="flex-1"
					/>
				)}
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
					variant="caption"
					className={
						variant === "filled"
							? "ml-card text-danger"
							: "mt-stack-xs ml-stack-sm text-danger"
					}
				>
					{error}
				</Text>
			)}
		</View>
	);
}

export type { FormInputProps };
export default FormInput;
