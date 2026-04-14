import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { Text } from "@/src/components/ui/text";
import BackButton from "@/src/components/ui/BackButton";
import { useThemeColors } from "@/src/lib/theme";
import { cn } from "@/src/lib/utils";

interface PageHeaderProps extends ViewProps {
	/** Main title text */
	readonly title: string;
	/** Optional subtitle beneath the title */
	readonly subtitle?: string;
	/** "app-primary" = coloured header (BackButton light variant).
	 *  "surface" = white/light header (BackButton surface variant). */
	readonly variant?: "app-primary" | "surface";
	/** Optional element rendered on the right side */
	readonly rightContent?: ReactNode;
	/** Override default back behaviour */
	readonly onBackPress?: () => void;
}

export default function PageHeader({
	title,
	subtitle,
	variant = "surface",
	rightContent,
	onBackPress,
	className,
	style,
	...props
}: Readonly<PageHeaderProps>) {
	const isBrand = variant === "app-primary";
	const themeColors = useThemeColors();
	const titleColor = isBrand
		? themeColors.onPrimaryHeader
		: themeColors.textPrimary;
	const subtitleColor = isBrand
		? themeColors.overlayBright
		: themeColors.textSecondary;

	return (
		<View
			className={cn(
				"min-h-16 flex-row items-center border-b border-border px-5 py-3",
				isBrand && "border-transparent",
				className,
			)}
			style={[
				{
					backgroundColor: isBrand
						? themeColors.primary
						: themeColors.surfaceBase,
				},
				style,
			]}
			{...props}
		>
			<BackButton
				variant={isBrand ? "header-inverse" : "header"}
				onPress={onBackPress}
				className="mr-3"
			/>

			<View className="flex-1">
				<Text
					className="font-bold text-[20px]"
					style={{ fontFamily: "GoogleSans_700Bold", color: titleColor }}
					numberOfLines={1}
				>
					{title}
				</Text>

				{subtitle && (
					<Text
						className="text-[12px]"
						style={{ fontFamily: "GoogleSans_400Regular", color: subtitleColor }}
					>
						{subtitle}
					</Text>
				)}
			</View>

			{rightContent}
		</View>
	);
}
