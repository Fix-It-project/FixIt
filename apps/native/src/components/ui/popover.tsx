/**
 * Themed popover built on `@rn-primitives/popover` (mirrors the dialog adapter
 * in `dialog.tsx`). Anchors to its `PopoverTrigger`, portals to the default
 * host, and fades in/out. Tokens only — no raw hex.
 */

import * as PopoverPrimitive from "@rn-primitives/popover";
import type * as React from "react";
import { Platform, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

function NativeOnlyAnimatedView(
	props: React.ComponentProps<typeof Animated.View>,
) {
	if (Platform.OS === "web") {
		return <>{props.children as React.ReactNode}</>;
	}
	return <Animated.View {...props} />;
}

type PopoverContentProps = React.ComponentProps<
	typeof PopoverPrimitive.Content
> & {
	readonly portalHost?: string;
};

function PopoverContent({
	className,
	align = "center",
	side = "top",
	sideOffset = 8,
	portalHost,
	style,
	...props
}: PopoverContentProps) {
	const themeColors = useThemeColors();

	return (
		<PopoverPrimitive.Portal hostName={portalHost}>
			<PopoverPrimitive.Overlay
				style={Platform.OS === "web" ? undefined : StyleSheet.absoluteFill}
			>
				<NativeOnlyAnimatedView
					entering={FadeIn.duration(140)}
					exiting={FadeOut.duration(100)}
				>
					<PopoverPrimitive.Content
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
			</PopoverPrimitive.Overlay>
		</PopoverPrimitive.Portal>
	);
}

export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
