import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface StatCardProps {
	readonly icon: React.ReactNode;
	readonly label: string;
	readonly value: string | number;
}

export default function StatCard({ icon, label, value }: StatCardProps) {
	return (
		<View className="flex-1 items-center gap-stack-xs rounded-input bg-surface-elevated px-stack-md py-card">
			{icon}
			<Text variant="buttonLg" className="mt-stack-xs font-bold text-content">
				{value}
			</Text>
			<Text variant="caption" className="text-content-muted">
				{label}
			</Text>
		</View>
	);
}
