import * as RadioGroupPrimitive from "@rn-primitives/radio-group";
import type * as React from "react";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useThemeColors } from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

/**
 * Themed radio group built on `@rn-primitives/radio-group`. `RadioGroup` owns
 * the selected `value` + `onValueChange`; each `RadioGroupItem` carries its
 * `value` and pops a filled dot in (ZoomIn) when selected. Tokens only.
 */
function RadioGroup({
	className,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
	return (
		<RadioGroupPrimitive.Root
			className={cn("gap-stack-sm", className)}
			{...props}
		/>
	);
}

function RadioGroupItem({
	className,
	style,
	...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
	const themeColors = useThemeColors();
	const themedStyle = { borderColor: themeColors.borderDefault };
	const itemStyle: React.ComponentProps<
		typeof RadioGroupPrimitive.Item
	>["style"] =
		typeof style === "function"
			? (state) => [themedStyle, style(state)]
			: [themedStyle, style];

	return (
		<RadioGroupPrimitive.Item
			className={cn(
				"h-icon-sm w-icon-sm items-center justify-center rounded-pill border-selected disabled:opacity-50",
				className,
			)}
			style={itemStyle}
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="items-center justify-center">
				<Animated.View
					entering={ZoomIn.duration(150)}
					className="h-status-dot-sm w-status-dot-sm rounded-pill"
					style={{ backgroundColor: themeColors.primary }}
				/>
			</RadioGroupPrimitive.Indicator>
		</RadioGroupPrimitive.Item>
	);
}

export { RadioGroup, RadioGroupItem };
