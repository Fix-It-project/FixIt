import { type LucideIcon, Wrench } from "lucide-react-native";
import type { ReactNode } from "react";
import { View } from "react-native";
import { ScreenSafeAreaView } from "@/src/components/layout/ScreenSafeAreaView";
import BackButton from "@/src/components/ui/back-button";
import { Text } from "@/src/components/ui/text";
import { getCategoryMeta } from "@/src/features/categories/constants/categories";
import { spacing, useThemeColors } from "@/src/constants/design-tokens";

interface BookingFlowHeaderProps {
	readonly categoryId: string | null | undefined;
	readonly categoryName: string | null | undefined;
	readonly children: ReactNode;
	readonly serviceName: string | null | undefined;
	readonly stepLabel: string;
	readonly technicianName: string | null | undefined;
	readonly onBackPress: () => void;
}

export default function BookingFlowHeader({
	categoryId,
	categoryName,
	children,
	serviceName,
	stepLabel,
	technicianName,
	onBackPress,
}: BookingFlowHeaderProps) {
	const themeColors = useThemeColors();
	const meta = getCategoryMeta(categoryId);
	const CategoryIcon: LucideIcon = meta?.icon ?? Wrench;
	const categoryColor = meta?.color ?? themeColors.primary;

	return (
		<ScreenSafeAreaView
			className="flex-1"
			edges={["top"]}
			style={{ backgroundColor: categoryColor }}
		>
			<View className="flex-1 bg-surface-elevated">
				<View
					style={{ backgroundColor: categoryColor }}
					className="pb-card-roomy"
				>
					<View className="flex-row items-center px-card pt-stack-sm pb-stack-xs">
						<BackButton
							variant="header-inverse"
							className="mr-stack-md"
							onPress={onBackPress}
						/>
						<View className="flex-1">
							<Text
								variant="h3"
								style={{ color: themeColors.onPrimaryHeader }}
								numberOfLines={1}
							>
								Book {technicianName ?? "Technician"}
							</Text>
							<Text
								variant="caption"
								style={{ color: themeColors.overlayBright }}
							>
								{serviceName ?? categoryName ?? "Service"} · {stepLabel}
							</Text>
						</View>
						<View className="h-control-icon-box-md w-control-icon-box-md items-center justify-center rounded-pill bg-overlay-md">
							<CategoryIcon
								size={spacing.icon.sm}
								color={themeColors.onPrimaryHeader}
								strokeWidth={1.75}
							/>
						</View>
					</View>
				</View>
				{children}
			</View>
		</ScreenSafeAreaView>
	);
}
