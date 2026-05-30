import { SlidersHorizontal } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Button } from "@/src/components/ui/button";
import {
	SORT_OPTIONS,
	type SortKey,
} from "@/src/features/technicians/types/sort";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

export {
	SORT_OPTIONS,
	type SortKey,
} from "@/src/features/technicians/types/sort";

interface TechnicianSortBarProps {
	readonly activeSort: SortKey;
	readonly onSortPress: (option: SortKey) => void;
}

export default function TechnicianSortBar({
	activeSort,
	onSortPress,
}: TechnicianSortBarProps) {
	const themeColors = useThemeColors();
	return (
		<View
			className="bg-surface py-stack-md"
			style={{
				borderBottomWidth: 1,
				borderBottomColor: themeColors.borderDefault,
			}}
		>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{
					paddingHorizontal: spacing.card.padding,
					gap: spacing.stack.sm,
				}}
			>
				<View
					className="mr-stack-xs h-control-icon-box-sm w-control-icon-box-sm items-center justify-center rounded-button"
					style={{ backgroundColor: themeColors.surfaceElevated }}
				>
					<SlidersHorizontal
						size={spacing.icon.xs}
						color={themeColors.textMuted}
						strokeWidth={2}
					/>
				</View>
				{SORT_OPTIONS.map((option) => {
					const isActive = activeSort === option;
					return (
						<Button
							key={option}
							variant={isActive ? "primary" : "ghost"}
							size="sm"
							onPress={() => onSortPress(option)}
							className={isActive ? "" : "bg-surface-elevated"}
						>
							{option}
						</Button>
					);
				})}
			</ScrollView>
		</View>
	);
}
