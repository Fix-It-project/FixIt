/**
 * Themed dropdown menu built on `@rn-primitives/dropdown-menu` (mirrors the
 * popover adapter). Anchors to its `DropdownMenuTrigger`, portals to the
 * default host, fades in/out. Tokens only — no raw hex.
 */

import * as DropdownMenuPrimitive from "@rn-primitives/dropdown-menu";
import type * as React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

function NativeOnlyAnimatedView(
	props: React.ComponentProps<typeof Animated.View>,
) {
	if (Platform.OS === "web") {
		return <>{props.children as React.ReactNode}</>;
	}
	return <Animated.View {...props} />;
}

type DropdownMenuContentProps = React.ComponentProps<
	typeof DropdownMenuPrimitive.Content
> & {
	readonly portalHost?: string;
};

function DropdownMenuContent({
	className,
	align = "end",
	side = "bottom",
	sideOffset = 6,
	portalHost,
	style,
	...props
}: DropdownMenuContentProps) {
	const themeColors = useThemeColors();

	return (
		<DropdownMenuPrimitive.Portal hostName={portalHost}>
			<DropdownMenuPrimitive.Overlay
				style={Platform.OS !== "web" ? StyleSheet.absoluteFill : undefined}
			>
				<NativeOnlyAnimatedView
					entering={FadeIn.duration(140)}
					exiting={FadeOut.duration(100)}
				>
					<DropdownMenuPrimitive.Content
						align={align}
						side={side}
						sideOffset={sideOffset}
						className={cn(
							"min-w-[180px] rounded-2xl border p-stack-xs",
							className,
						)}
						style={StyleSheet.flatten([
							{
								backgroundColor: themeColors.surfaceElevated,
								borderColor: themeColors.borderDefault,
							},
							shadowStyle(elevation.header, {
								shadowColor: themeColors.shadow,
								opacity: 0.18,
								radius: 16,
								android: 8,
							}),
							style,
						])}
						{...props}
					/>
				</NativeOnlyAnimatedView>
			</DropdownMenuPrimitive.Overlay>
		</DropdownMenuPrimitive.Portal>
	);
}

function DropdownMenuItem({
	className,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
	return (
		<DropdownMenuPrimitive.Item
			className={cn(
				"flex-row items-center gap-stack-sm rounded-xl px-stack-sm py-stack-sm active:opacity-60",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuLabel({
	className,
	...props
}: React.ComponentProps<typeof Text>) {
	return (
		<Text
			variant="caption"
			className={cn(
				"px-stack-sm pt-stack-xs pb-1 text-content-muted",
				className,
			)}
			{...props}
		/>
	);
}

function DropdownMenuSeparator({
	className,
	style,
	...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
	const themeColors = useThemeColors();
	return (
		<DropdownMenuPrimitive.Separator
			className={cn("my-1 h-px", className)}
			style={[{ backgroundColor: themeColors.borderDefault }, style as object]}
			{...props}
		/>
	);
}

export {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
};
