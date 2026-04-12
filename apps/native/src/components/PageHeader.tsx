import type { ReactNode } from "react";
import { View, type ViewProps } from "react-native";
import { Text } from "@/src/components/ui/text";
import BackButton from "@/src/components/ui/BackButton";
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
	...props
}: Readonly<PageHeaderProps>) {
	const isBrand = variant === "app-primary";

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
