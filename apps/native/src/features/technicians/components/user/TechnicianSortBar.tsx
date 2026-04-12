import { SlidersHorizontal } from "lucide-react-native";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import {
	SORT_OPTIONS,
	type SortKey,
} from "@/src/features/technicians/types/sort";
import { Colors, useThemeColors } from "@/src/lib/theme";

export type { SortKey } from "@/src/features/technicians/types/sort";
export { SORT_OPTIONS } from "@/src/features/technicians/types/sort";

interface TechnicianSortBarProps {
	activeSort: SortKey;
	onSortPress: (option: SortKey) => void;
}

export default function TechnicianSortBar({
	activeSort,
	onSortPress,
}: TechnicianSortBarProps) {
	const themeColors = useThemeColors();
	return (
		<View
			className="bg-surface py-2.5"
			style={{
				borderBottomWidth: 1,
				borderBottomColor: themeColors.borderDefault,
			}}
		>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
			>
				<View
					className="mr-1 h-8 w-8 items-center justify-center rounded-lg"
					style={{ backgroundColor: themeColors.surfaceElevated }}
				>
					<SlidersHorizontal
						size={16}
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
							className="items-center justify-center rounded-full px-4"
							style={{
								height: 32,
								backgroundColor: isActive
									? Colors.primary
									: themeColors.surfaceElevated,
							}}
						>
							<Text
								className="font-semibold text-[12px]"
								style={{
									fontFamily: "GoogleSans_600SemiBold",
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
