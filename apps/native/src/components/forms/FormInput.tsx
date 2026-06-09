import { CircleX, type LucideIcon } from "lucide-react-native";
import {
	I18nManager,
	Pressable,
	type TextStyle,
	View,
	type ViewStyle,
} from "react-native";
import { Input, type InputProps } from "@/src/components/ui/input";
import { Text } from "@/src/components/ui/text";
import { Textarea } from "@/src/components/ui/textarea";
import { Colors } from "@/src/constants/design-tokens";

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
	readonly testID?: string;
	readonly textDirection?: TextStyle["writingDirection"];
	readonly textAlign?: TextStyle["textAlign"];
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
	testID,
	textDirection = "auto",
	textAlign = "auto",
}: FormInputProps) {
	const isRTL = I18nManager.isRTL;
	const hasAccessory =
		(clearable && value.length > 0) || (!!Icon && !clearable);
	const accessoryStyle: ViewStyle = isRTL ? { left: 16 } : { right: 16 };
	const inputAccessoryPadding: TextStyle | undefined = hasAccessory
		? isRTL
			? { paddingLeft: 48 }
			: { paddingRight: 48 }
		: undefined;
	const textDirectionStyle: TextStyle = {
		textAlign,
		writingDirection: textDirection,
	};

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
						testID={testID}
						className="flex-1"
						style={[inputAccessoryPadding, textDirectionStyle]}
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
						testID={testID}
						className="flex-1"
						style={[inputAccessoryPadding, textDirectionStyle]}
					/>
				)}
				{clearable && value.length > 0 && (
					<Pressable
						onPress={onClear}
						hitSlop={8}
						className="absolute active:opacity-70"
						style={accessoryStyle}
					>
						<CircleX size={20} color={Colors.textMuted} />
					</Pressable>
				)}
				{Icon && !clearable && (
					<View className="absolute" style={accessoryStyle}>
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
