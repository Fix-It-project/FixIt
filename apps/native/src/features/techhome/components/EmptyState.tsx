import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

/** Quiet filled-card empty state for dashboard sections. */
export function EmptyState({ title, body }: { title: string; body: string }) {
	return (
		<View className="items-center rounded-card bg-surface-elevated px-card py-stack-xl">
			<Text variant="body" className="font-semibold text-content">
				{title}
			</Text>
			<Text variant="caption" className="mt-1 text-center text-content-muted">
				{body}
			</Text>
		</View>
	);
}
