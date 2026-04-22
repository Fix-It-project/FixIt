import { TriangleAlert } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface ErrorBannerProps {
	readonly message: string | null;
	readonly variant?: "default" | "warning";
}

export default function ErrorBanner({
	message,
	variant = "default",
}: ErrorBannerProps) {
	if (!message) return null;

	if (variant === "warning") {
		return (
			<View className="mx-5 mb-4 flex-row items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
				<TriangleAlert size={18} color={Colors.warning} className="mr-2" />
				<Text variant="bodySm" className="flex-1 text-amber-800">
					{message}
				</Text>
			</View>
		);
	}

	return (
		<View className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
			<Text variant="bodySm" className="text-center text-red-600">
				{message}
			</Text>
		</View>
	);
}
