import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";
import { Icon } from "@/src/components/ui/icon";
import { Text, TextClassContext } from "@/src/components/ui/text";
import { cn } from "@/src/lib/utils";

function Alert({
	className,
	variant,
	children,
	icon,
	iconClassName,
	...props
}: React.ComponentProps<typeof View> &
	React.RefAttributes<View> & {
		icon: LucideIcon;
		variant?: "default" | "destructive";
		iconClassName?: string;
	}) {
	return (
		<TextClassContext.Provider
			value={cn(
				"text-content text-sm",
				variant === "destructive" && "text-danger",
			)}
		>
			<View
				role="alert"
				className={cn(
					"relative w-full rounded-card border border-edge bg-surface px-card pt-3.5 pb-2",
					className,
				)}
				{...props}
			>
				<View className="absolute top-3 left-3.5">
					<Icon
						as={icon}
						className={cn(
							"size-4",
							variant === "destructive" && "text-danger",
							iconClassName,
						)}
					/>
				</View>
				{children}
			</View>
		</TextClassContext.Provider>
	);
}

function AlertTitle({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			className={cn(
				"mb-1 ml-0.5 min-h-4 pl-6 font-medium leading-none tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	const textClass = React.useContext(TextClassContext);
	return (
		<Text
			className={cn(
				"ml-0.5 pb-1.5 pl-6 text-content-muted text-sm leading-relaxed",
				textClass?.includes("text-danger") && "text-danger",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertDescription, AlertTitle };
