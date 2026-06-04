import { memo } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text } from "@/src/components/ui/text";
import { spacing } from "@/src/constants/design-tokens";
import {
	SORT_OPTIONS,
	type SortKey,
} from "@/src/features/technicians/types/sort";

interface SortBarProps {
	readonly activeSort: SortKey;
	readonly onSortPress: (sort: SortKey) => void;
}

function SortBarComponent({ activeSort, onSortPress }: SortBarProps) {
	return (
		<ScrollView
			horizontal
			showsHorizontalScrollIndicator={false}
			contentContainerStyle={{
				paddingHorizontal: spacing.screen.paddingX,
				paddingBottom: spacing.stack.xl,
				gap: spacing.stack.sm,
			}}
		>
			{SORT_OPTIONS.map((option) => {
				const isActive = option === activeSort;
				return (
					<Pressable
						key={option}
						onPress={() => onSortPress(option)}
						className={
							isActive
								? "h-control-chip justify-center rounded-compact bg-app-primary px-control-pill-x"
								: "h-control-chip justify-center rounded-compact bg-surface-elevated px-control-pill-x"
						}
						accessibilityRole="button"
						accessibilityState={{ selected: isActive }}
					>
						<Text
							variant="caption"
							className={
								isActive
									? "font-semibold text-surface-on-primary"
									: "font-medium text-content-secondary"
							}
						>
							{option}
						</Text>
					</Pressable>
				);
			})}
		</ScrollView>
	);
}

export const SortBar = memo(SortBarComponent);
