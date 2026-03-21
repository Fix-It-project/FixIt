import type React from "react";
import { View, type ViewProps } from "react-native";
import { Text } from "@/src/components/ui/text";
import BackButton from "@/src/components/ui/BackButton";
import { cn } from "@/src/lib/utils";

interface PageHeaderProps extends ViewProps {
	/** Main title text */
	title: string;
	/** Optional subtitle beneath the title */
	subtitle?: string;
	/** "brand" = coloured header (BackButton light variant).
	 *  "surface" = white/light header (BackButton surface variant). */
	variant?: "brand" | "surface";
	/** Optional element rendered on the right side */
	rightContent?: React.ReactNode;
	/** Override default back behaviour */
	onBackPress?: () => void;
}

export default function PageHeader({
	title,
	subtitle,
	variant = "surface",
	rightContent,
	onBackPress,
	className,
	...props
}: PageHeaderProps) {
	const isBrand = variant === "brand";

	return (
		<View
			className={cn("flex-row items-center px-4 pt-2 pb-2", className)}
			{...props}
		>
			<BackButton
				variant={isBrand ? "light" : "surface"}
				onPress={onBackPress}
				className="mr-3"
			/>

			<View className="flex-1">
				<Text
					className={cn(
						"font-bold text-[20px]",
						isBrand ? "text-white" : "text-content"
					)}
					style={{ fontFamily: "GoogleSans_700Bold" }}
					numberOfLines={1}
				>
					{title}
				</Text>

				{subtitle && (
					<Text
						className={cn(
							"text-[12px]",
							isBrand ? "text-white/70" : "text-content-muted"
						)}
						style={{ fontFamily: "GoogleSans_400Regular" }}
					>
						{subtitle}
					</Text>
				)}
			</View>

			{rightContent}
		</View>
	);
}
