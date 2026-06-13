import { View } from "react-native";
import { Text } from "@/src/components/ui/text";

interface SectionHeaderProps {
	title: string;
	hint?: string;
	action?: React.ReactNode;
}

export function SectionHeader({ title, hint, action }: SectionHeaderProps) {
	return (
		<View className="mb-stack-sm flex-row items-end justify-between">
			<View className="flex-1">
				<Text variant="h3" className="font-bold text-content" numberOfLines={1}>
					{title}
				</Text>
				{hint ? (
					<Text
						variant="caption"
						className="text-content-muted"
						numberOfLines={1}
					>
						{hint}
					</Text>
				) : null}
			</View>
			{action}
		</View>
	);
}
