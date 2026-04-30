import { SlidersHorizontal } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	SORT_OPTIONS,
	type SortKey,
} from "@/src/features/technicians/types/sort";
import { Colors, spacing, useThemeColors } from "@/src/lib/theme";

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
						color={themeColors.surfaceMuted}
						strokeWidth={2}
					/>
				</View>
				{SORT_OPTIONS.map((option) => {
					const isActive = activeSort === option;
					return (
						<TouchableOpacity
							key={option}
							onPress={() => onSortPress(option)}
							activeOpacity={0.7}
							className="h-control-chip items-center justify-center rounded-chip px-control-chip"
							style={{
								backgroundColor: isActive
									? Colors.primary
									: themeColors.surfaceElevated,
							}}
						>
							<Text
								variant="caption"
								className="font-semibold"
								style={{
									color: isActive
										? themeColors.surfaceBase
										: themeColors.textSecondary,
								}}
							>
								{option}
							</Text>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</View>
	);
}
