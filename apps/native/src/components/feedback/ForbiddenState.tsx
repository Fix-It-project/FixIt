import { Lock } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Colors } from "@/src/lib/theme";

interface ForbiddenStateProps {
	readonly message?: string;
}

export default function ForbiddenState({ message }: ForbiddenStateProps) {
	return (
		<View className="mx-screen-x rounded-card border border-danger bg-danger-light px-card py-stack-md">
			<View className="flex-row items-center">
				<Lock size={20} color={Colors.danger} className="mr-stack-sm" />
				<Text variant="bodyLg" className="flex-1 text-danger">
					{message ?? "You don't have access to this."}
				</Text>
			</View>
		</View>
	);
}
