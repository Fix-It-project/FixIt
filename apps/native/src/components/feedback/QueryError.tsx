import { TriangleAlert } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface QueryErrorProps {
	readonly onRetry?: () => void;
	readonly message?: string;
}

export default function QueryError({ onRetry, message }: QueryErrorProps) {
	return (
		<View className="mx-screen-x rounded-card border border-danger bg-danger-light px-card py-stack-md">
			<View className="flex-row items-center">
				<TriangleAlert
					size={20}
					color={Colors.danger}
					className="mr-stack-sm"
				/>
				<Text variant="bodyLg" className="flex-1 text-danger">
					{message ??
						"We couldn't load this. Check your connection and try again."}
				</Text>
			</View>
			{onRetry ? (
				<Button onPress={onRetry} variant="secondary" className="mt-stack-sm">
					<Text>Try again</Text>
				</Button>
			) : null}
		</View>
	);
}
