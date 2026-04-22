import { CircleX, type LucideIcon } from "lucide-react-native";
import { Pressable, type TextInputProps, View } from "react-native";
import { Input } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface FormInputProps {
	readonly label?: string;
	readonly value: string;
	readonly onChangeText: (text: string) => void;
	readonly placeholder: string;
	readonly icon?: LucideIcon;
	readonly error?: string;
	readonly disabled?: boolean;
	readonly keyboardType?: TextInputProps["keyboardType"];
	readonly autoCapitalize?: TextInputProps["autoCapitalize"];
	readonly variant?: "filled" | "outline";
	readonly clearable?: boolean;
	readonly onClear?: () => void;
	readonly required?: boolean;
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
				<Text variant="buttonMd" className="text-content">
					{label}
					{required && (
						<Text variant="buttonMd" className="text-red-500">
							{" "}
							*
						</Text>
					)}
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
					variant="caption"
					className={
						variant === "filled"
							? "ml-4 text-red-500"
							: "mt-1 ml-2 text-red-500"
					}
				>
					{error}
				</Text>
			)}
		</View>
	);
}
