import { View, Text } from "react-native";

interface ErrorBannerProps {
	message: string | null;
}

export default function ErrorBanner({ message }: ErrorBannerProps) {
	if (!message) return null;

	return (
		<View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
			<Text className="text-red-600 text-[14px] text-center">{message}</Text>
		</View>
	);
}
