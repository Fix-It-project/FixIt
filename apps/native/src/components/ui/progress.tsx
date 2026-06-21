import * as ProgressPrimitive from "@rn-primitives/progress";
import type * as React from "react";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useDerivedValue,
	withSpring,
} from "react-native-reanimated";
import { cn } from "@/src/lib/utils";

/**
 * Progress bar (react-native-reusables / `@rn-primitives/progress`).
 * Track = `secondary` (muted gray), indicator = `primary` (brand blue).
 * `value` is 0–100; the fill width animates with a spring.
 */
function Progress({
	className,
	value,
	indicatorClassName,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
	indicatorClassName?: string;
}) {
	return (
		<ProgressPrimitive.Root
			className={cn(
				"relative h-2 w-full overflow-hidden rounded-full bg-secondary",
				className,
			)}
			value={value}
			{...props}
		>
			<ProgressIndicator value={value} className={indicatorClassName} />
		</ProgressPrimitive.Root>
	);
}

function ProgressIndicator({
	value,
	className,
}: Readonly<{
	value?: number | null;
	className?: string;
}>) {
	const progress = useDerivedValue(() => value ?? 0);

	const indicatorStyle = useAnimatedStyle(() => ({
		width: withSpring(
			`${interpolate(progress.value, [0, 100], [1, 100], Extrapolation.CLAMP)}%`,
			{ overshootClamping: true },
		),
	}));

	return (
		<ProgressPrimitive.Indicator asChild>
			<Animated.View
				className={cn("h-full rounded-full bg-primary", className)}
				style={indicatorStyle}
			/>
		</ProgressPrimitive.Indicator>
	);
}

export { Progress };
