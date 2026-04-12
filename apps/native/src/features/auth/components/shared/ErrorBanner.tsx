import { View, Text } from "react-native";
import { TriangleAlert } from "lucide-react-native";
import { Colors } from "@/src/lib/theme";

interface ErrorBannerProps {
	message: string | null;
	variant?: "default" | "warning";
}

export default function ErrorBanner({
	message,
	variant = "default",
}: ErrorBannerProps) {
	if (!message) return null;

	if (variant === "warning") {
		return (
			<View className="mx-5 mb-4 flex-row items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
				<TriangleAlert size={18} color={Colors.warning} style={{ marginRight: 8 }} />
				<Text className="flex-1 text-[13px] text-amber-800">{message}</Text>
			</View>
		);
	}

	return (
		<View className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
			<Text className="text-red-600 text-[14px] text-center">{message}</Text>
		</View>
	);
}
