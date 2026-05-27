import { SearchX } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface NotFoundStateProps {
	readonly message?: string;
}

export default function NotFoundState({ message }: NotFoundStateProps) {
	return (
		<View className="mx-screen-x rounded-card border border-danger bg-danger-light px-card py-stack-md">
			<View className="flex-row items-center">
				<SearchX size={20} color={Colors.danger} className="mr-stack-sm" />
				<Text variant="bodyLg" className="flex-1 text-danger">
					{message ?? "We couldn't find what you were looking for."}
				</Text>
			</View>
		</View>
	);
}
