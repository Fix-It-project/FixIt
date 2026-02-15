import { Pressable, Text, ActivityIndicator } from "react-native";

interface SubmitButtonProps {
	label: string;
	onPress: () => void;
	isLoading?: boolean;
	disabled?: boolean;
	color?: string;
}

export default function SubmitButton({
	label,
	onPress,
	isLoading = false,
	disabled = false,
	color = "#036ded",
}: SubmitButtonProps) {
	const isActive = !disabled && !isLoading;

	return (
		<Pressable
			className={`h-14 rounded-full items-center justify-center mt-2 ${isActive ? "active:opacity-90" : ""}`}
			style={{ backgroundColor: isActive ? color : `${color}80` }}
			onPress={onPress}
			disabled={!isActive}
		>
			{isLoading ? (
				<ActivityIndicator color="#ffffff" />
			) : (
				<Text className="text-white text-[16px] font-bold">{label}</Text>
			)}
		</Pressable>
	);
}
