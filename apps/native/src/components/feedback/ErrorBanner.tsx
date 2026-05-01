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
			<View className="mx-screen-x mb-stack-lg flex-row items-center rounded-input border border-warning bg-warning-light px-card py-stack-md">
				<TriangleAlert
					size={18}
					color={Colors.warning}
					className="mr-stack-sm"
				/>
				<Text variant="bodySm" className="flex-1 text-warning">
					{message}
				</Text>
			</View>
		);
	}

	return (
		<View className="rounded-card border border-danger bg-danger-light px-card py-stack-md">
			<Text variant="bodySm" className="text-center text-danger">
				{message}
			</Text>
		</View>
	);
}
