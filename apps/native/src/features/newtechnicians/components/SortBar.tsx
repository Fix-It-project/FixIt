import { Text } from "@/src/components/ui/text";
import { spacing } from "@/src/constants/design-tokens";
import {
	SORT_OPTIONS,
	type SortKey,
} from "@/src/features/technicians/types/sort";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";

interface SortBarProps {
	readonly activeSort: SortKey;
	readonly onSortPress: (sort: SortKey) => void;
}

function SortBarComponent({ activeSort, onSortPress }: SortBarProps) {
	const { t } = useTranslation("technicians");
	return (
		<View className="shrink-0 bg-background pb-stack-lg">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={{ flexGrow: 0 }}
				contentContainerStyle={{
					paddingHorizontal: spacing.screen.paddingX,
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
									: "h-control-chip justify-center rounded-compact bg-surface-muted px-control-pill-x"
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
								{t(`sort.${option}` as Parameters<typeof t>[0])}
							</Text>
						</Pressable>
					);
				})}
			</ScrollView>
		</View>
	);
}

export const SortBar = memo(SortBarComponent);
