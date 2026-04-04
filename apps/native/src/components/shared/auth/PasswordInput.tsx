import { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Colors } from "@/src/lib/colors";

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
	const [visible, setVisible] = useState(false);
	const [showLast, setShowLast] = useState(false);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleChangeText = useCallback(
		(text: string) => {
			onChangeText(text);
			if (!visible && text.length > value.length) {
				if (hideTimer.current) clearTimeout(hideTimer.current);
				setShowLast(true);
				hideTimer.current = setTimeout(() => setShowLast(false), 800);
			} else {
				setShowLast(false);
			}
		},
		[onChangeText, visible, value.length],
	);

	// Build masked display: "●●●●a" when showLast, "●●●●●" otherwise
	const maskedValue =
		visible || value.length === 0
			? value
			: showLast && value.length > 0
				? "\u25CF".repeat(value.length - 1) + value.slice(-1)
				: "\u25CF".repeat(value.length);

	const isFilled = variant === "filled";

	const containerClass = isFilled
		? `bg-white h-14 rounded-full flex-row items-center px-6 ${error ? "border border-red-400" : ""}`
		: `h-14 rounded-2xl flex-row items-center px-5 border ${
				error
					? "border-red-400"
					: value.length > 0
						? "border-brand"
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
					value={visible ? value : maskedValue}
					onChangeText={(text) => {
						// When masked, the user edits dot characters — derive the real value
						if (visible) {
							handleChangeText(text);
						} else {
							const dots = maskedValue;
							if (text.length > dots.length) {
								// Character(s) appended
								handleChangeText(value + text.slice(dots.length));
							} else if (text.length < dots.length) {
								// Character(s) deleted
								handleChangeText(value.slice(0, text.length));
							} else {
								handleChangeText(value);
							}
						}
					}}
					placeholder={placeholder}
					placeholderTextColor={Colors.textMuted}
					secureTextEntry={false}
					autoCorrect={false}
					autoCapitalize="none"
					editable={!disabled}
					className="flex-1 text-[16px] text-content"
				/>
				<Pressable onPress={() => setVisible((v) => !v)} hitSlop={8}>
					{visible ? (
						<Eye size={20} color={Colors.textMuted} />
					) : (
						<EyeOff size={20} color={Colors.textMuted} />
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
