import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { Icon } from "@/src/components/ui/icon";
import { Text } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";

interface JobsEmptyStateProps {
	readonly icon: LucideIcon;
	readonly title: string;
	readonly subtitle: string;
}

export function JobsEmptyState({ icon, title, subtitle }: JobsEmptyStateProps) {
	const themeColors = useThemeColors();
	return (
		<View className="flex-1 items-center justify-center px-button-x py-stack-xl">
			<Icon
				as={icon}
				size={40}
				color={themeColors.borderDefault}
				strokeWidth={1.5}
			/>
			<Text variant="buttonLg" className="mt-stack-md text-center text-content">
				{title}
			</Text>
			<Text
				variant="bodySm"
				className="mt-stack-xs text-center text-content-muted"
			>
				{subtitle}
			</Text>
		</View>
	);
}
