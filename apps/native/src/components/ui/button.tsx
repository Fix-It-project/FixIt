import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react-native";
import * as React from "react";
import {
	ActivityIndicator,
	type GestureResponderEvent,
	Platform,
	Pressable,
	type PressableAndroidRippleConfig,
	type PressableProps,
	type PressableStateCallbackType,
	StyleSheet,
	type StyleProp,
	View,
	type ViewStyle,
} from "react-native";
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { Text, TextClassContext } from "@/src/components/ui/text";
import { useThemeColors } from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

// ─── Animated wrapper ─────────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Spring configs ──────────────────────────────────────────────────────
// Press: quick + snappy; Release: slightly looser so the button settles, not snaps.
const PRESS_SPRING = { damping: 18, stiffness: 320, mass: 0.7 } as const;
const RELEASE_SPRING = { damping: 14, stiffness: 220, mass: 0.8 } as const;

// ─── Icon size per button size ───────────────────────────────────────────
const ICON_SIZE: Record<string, number> = {
	sm: 14,
	md: 18,
	lg: 20,
	xl: 22,
	icon: 20,
};

// ─── CVA: container variants ─────────────────────────────────────────────
// Note: `relative` + `overflow-hidden` are required for the inner highlight
// and press overlay to clip correctly to the button's rounded radius.
const buttonVariants = cva(
	cn(
		"relative shrink-0 flex-row items-center justify-center overflow-hidden rounded-button",
		Platform.select({
			web: "outline-none disabled:pointer-events-none",
		}),
	),
	{
		variants: {
			variant: {
				primary: "bg-app-primary",
				secondary: "border border-edge bg-surface-elevated",
				outline: "border border-input bg-background",
				ghost: "",
				tonal: "bg-app-primary-light",
				destructive: "bg-destructive",
				success: "bg-success",
				link: "",
			},
			size: {
				sm: "h-btn-sm gap-stack-xs px-button-sm-x",
				md: "h-btn-md gap-stack-xs px-button-x",
				lg: "h-btn-lg gap-stack-xs px-button-lg-x",
				xl: "h-btn-xl gap-stack-xs px-button-lg-x",
				icon: "h-control-icon-box-lg w-control-icon-box-lg",
			},
			fullWidth: {
				true: "w-full",
				false: "",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "md",
			fullWidth: false,
		},
	},
);

// ─── CVA: text variants ──────────────────────────────────────────────────
// font-semibold (not bold) with tighter tracking on the larger sizes.
const buttonTextVariants = cva("font-semibold", {
	variants: {
		variant: {
			primary: "text-surface-on-primary",
			secondary: "text-foreground",
			outline: "text-foreground",
			ghost: "text-foreground",
			tonal: "text-app-primary",
			destructive: "text-surface-on-primary",
			success: "text-surface-on-primary",
			link: "text-app-primary underline",
		},
		size: {
			sm: "text-sm",
			md: "text-base",
			lg: "text-base tracking-tight",
			xl: "text-lg tracking-tight",
			icon: "",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
	},
});

// ─── Variant classification sets ─────────────────────────────────────────
type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
const FILLED_VARIANTS = new Set<ButtonVariant>([
	"primary",
	"destructive",
	"success",
]);
// Variants that carry an elevation/drop shadow at rest.
const SHADOWED_VARIANTS = new Set<ButtonVariant>([
	"primary",
	"destructive",
	"success",
	"secondary",
]);

// ─── Props ────────────────────────────────────────────────────────────────
type ButtonProps = PressableProps &
	VariantProps<typeof buttonVariants> & {
		loading?: boolean;
		fullWidth?: boolean;
		iconLeft?: LucideIcon | React.ReactNode;
		iconRight?: LucideIcon | React.ReactNode;
		accessibilityLabel?: string;
		style?: StyleProp<ViewStyle>;
	};

function isIconComponent(
	icon: LucideIcon | React.ReactNode,
): icon is LucideIcon {
	return (
		typeof icon === "function" ||
		(typeof icon === "object" &&
			icon !== null &&
			"$$typeof" in icon &&
			"render" in icon)
	);
}

function resolveIcon(
	icon: LucideIcon | React.ReactNode | undefined,
	size: string,
	color: string,
): React.ReactNode {
	if (!icon) return undefined;
	if (isIconComponent(icon)) {
		const Icon = icon;
		return <Icon size={ICON_SIZE[size] ?? 18} color={color} />;
	}
	return icon as React.ReactNode;
}

// ─── Color/shadow resolvers ──────────────────────────────────────────────
function getContentColor(
	variant: ButtonVariant,
	themeColors: ReturnType<typeof useThemeColors>,
): string {
	switch (variant) {
		case "primary":
		case "destructive":
		case "success":
			return themeColors.surfaceOnPrimary;
		case "tonal":
		case "link":
			return themeColors.primary;
		default:
			return themeColors.textPrimary;
	}
}

// Variant-tinted shadow — the single biggest "premium" tell.
function getShadowColor(
	variant: ButtonVariant,
	themeColors: ReturnType<typeof useThemeColors>,
): string {
	switch (variant) {
		case "primary":
			return themeColors.primary;
		case "destructive":
			return themeColors.danger;
		case "success":
			return themeColors.success;
		default:
			return themeColors.shadow;
	}
}

// Brightness-shift overlay rendered on press-in.
// Filled variants darken (black at low alpha); bordered/ghost get a primary tint.
function getPressOverlay(
	variant: ButtonVariant,
	themeColors: ReturnType<typeof useThemeColors>,
): { color: string; maxOpacity: number } {
	switch (variant) {
		case "primary":
		case "destructive":
		case "success":
			return { color: "#000000", maxOpacity: 0.18 };
		case "tonal":
			return { color: themeColors.primary, maxOpacity: 0.1 };
		case "secondary":
			return { color: themeColors.textPrimary, maxOpacity: 0.06 };
		case "outline":
		case "ghost":
			return { color: themeColors.primary, maxOpacity: 0.08 };
		case "link":
		default:
			return { color: "transparent", maxOpacity: 0 };
	}
}

function getRippleColor(variant: ButtonVariant): string | undefined {
	switch (variant) {
		case "primary":
		case "destructive":
		case "success":
			return "rgba(255,255,255,0.18)";
		case "tonal":
		case "outline":
		case "ghost":
		case "link":
			return "rgba(37,99,235,0.12)";
		default:
			return Platform.select({
				android: "rgba(148,163,184,0.20)",
				default: "rgba(15,23,42,0.10)",
			});
	}
}

function getRestShadowOpacity(variant: ButtonVariant): number {
	if (FILLED_VARIANTS.has(variant)) return 0.22;
	if (variant === "secondary") return 0.06;
	return 0;
}

function getRestElevation(variant: ButtonVariant): number {
	if (FILLED_VARIANTS.has(variant)) return 5;
	if (variant === "secondary") return 2;
	return 0;
}

type IconLikeChildProps = {
	color?: string;
	size?: number;
	strokeWidth?: number;
	absoluteStrokeWidth?: boolean;
	children?: React.ReactNode;
};

// ─── Children helpers (string → <Text>, fragment unwrap) ─────────────────
function renderButtonChild(
	child: React.ReactNode,
	size: string,
	color: string,
): React.ReactNode {
	if (typeof child === "string" || typeof child === "number") {
		return <Text>{child}</Text>;
	}
	if (
		React.isValidElement<IconLikeChildProps>(child) &&
		child.type === React.Fragment
	) {
		return (
			<>
				{React.Children.map(child.props.children, (fragmentChild) =>
					renderButtonChild(fragmentChild, size, color),
				)}
			</>
		);
	}
	if (React.isValidElement<IconLikeChildProps>(child)) {
		const looksLikeIcon =
			"size" in child.props ||
			"strokeWidth" in child.props ||
			"absoluteStrokeWidth" in child.props;

		if (looksLikeIcon) {
			const iconProps: Partial<IconLikeChildProps> = {};
			if (child.props.color === undefined) iconProps.color = color;
			if (child.props.size === undefined) iconProps.size = ICON_SIZE[size] ?? 18;

			if (Object.keys(iconProps).length > 0) {
				return React.cloneElement(child, iconProps);
			}
		}
	}
	return child;
}

function renderButtonChildren(
	children: ButtonProps["children"],
	size: string,
	color: string,
) {
	if (typeof children === "function") {
		return (state: PressableStateCallbackType) =>
			React.Children.map(children(state), (child) =>
				renderButtonChild(child, size, color),
			);
	}
	return React.Children.map(children, (child) =>
		renderButtonChild(child, size, color),
	);
}

// ─── Component ────────────────────────────────────────────────────────────
const Button = React.forwardRef<
	React.ComponentRef<typeof Pressable>,
	ButtonProps
>(function Button(
	{
		className,
		variant = "primary",
		size = "md",
		loading = false,
		disabled = false,
		fullWidth = false,
		iconLeft,
		iconRight,
		accessibilityLabel,
		children,
		onPressIn,
		onPressOut,
		android_ripple,
		style,
		...props
	},
	ref,
) {
	const themeColors = useThemeColors();
	const reducedMotion = useReducedMotion();
	const resolvedVariant = (variant ?? "primary") as ButtonVariant;
	const resolvedSize = (size ?? "md") as string;

	const hasShadow = SHADOWED_VARIANTS.has(resolvedVariant);
	const hasInnerHighlight = FILLED_VARIANTS.has(resolvedVariant);
	const isLink = resolvedVariant === "link";

	const restShadowOpacity = getRestShadowOpacity(resolvedVariant);
	const restElevation = getRestElevation(resolvedVariant);

	// Shared animated values
	const scale = useSharedValue(1);
	const shadowOpacity = useSharedValue(restShadowOpacity);
	const androidElevation = useSharedValue(restElevation);
	const pressOverlayOpacity = useSharedValue(0);
	const opacityFallback = useSharedValue(1);

	// Resolve per-variant visuals (memoized — they only change when theme/variant changes).
	const pressOverlay = React.useMemo(
		() => getPressOverlay(resolvedVariant, themeColors),
		[resolvedVariant, themeColors],
	);
	const shadowColor = React.useMemo(
		() => getShadowColor(resolvedVariant, themeColors),
		[resolvedVariant, themeColors],
	);
	const contentColor = React.useMemo(
		() => getContentColor(resolvedVariant, themeColors),
		[resolvedVariant, themeColors],
	);

	const animatedContainerStyle = useAnimatedStyle(() => {
		if (reducedMotion) {
			return { opacity: opacityFallback.value };
		}
		return {
			transform: [{ scale: scale.value }],
			shadowColor,
			shadowOffset: { width: 0, height: hasShadow ? 4 : 0 },
			shadowRadius: hasShadow ? 10 : 0,
			shadowOpacity: shadowOpacity.value,
			elevation: androidElevation.value,
		};
	});

	const animatedPressOverlayStyle = useAnimatedStyle(() => ({
		opacity: pressOverlayOpacity.value,
	}));

	const handlePressIn = (e: GestureResponderEvent) => {
		if (reducedMotion) {
			opacityFallback.value = withTiming(0.75, { duration: 80 });
		} else if (!disabled && !loading) {
			scale.value = withSpring(0.97, PRESS_SPRING);
			pressOverlayOpacity.value = withTiming(pressOverlay.maxOpacity, {
				duration: 90,
			});
			if (hasShadow) {
				// Shadow softens on press (button "presses into" surface) but doesn't
				// vanish — keeping a hint preserves the depth read.
				shadowOpacity.value = withSpring(restShadowOpacity * 0.4, PRESS_SPRING);
				androidElevation.value = withSpring(
					Math.max(restElevation - 3, 0),
					PRESS_SPRING,
				);
			}
		}

		onPressIn?.(e);
	};

	const handlePressOut = (e: GestureResponderEvent) => {
		if (reducedMotion) {
			opacityFallback.value = withTiming(1, { duration: 140 });
		} else if (!disabled && !loading) {
			scale.value = withSpring(1, RELEASE_SPRING);
			pressOverlayOpacity.value = withTiming(0, { duration: 180 });
			if (hasShadow) {
				shadowOpacity.value = withSpring(restShadowOpacity, RELEASE_SPRING);
				androidElevation.value = withSpring(restElevation, RELEASE_SPRING);
			}
		}

		onPressOut?.(e);
	};

	const textVariantClass = buttonTextVariants({
		variant: resolvedVariant,
		size,
	});
	const rippleConfig: PressableAndroidRippleConfig | undefined =
		android_ripple ??
		Platform.select({
			android: {
				color: getRippleColor(resolvedVariant),
				borderless: false,
				foreground: true,
			},
			default: undefined,
		});

	return (
		<TextClassContext.Provider value={textVariantClass}>
			<AnimatedPressable
				ref={ref}
				role="button"
				accessibilityRole="button"
				accessibilityLabel={accessibilityLabel}
				accessibilityState={{ disabled: disabled || loading, busy: loading }}
				hitSlop={8}
				disabled={disabled || loading}
				onPressIn={handlePressIn}
				onPressOut={handlePressOut}
				android_ripple={rippleConfig}
				className={cn(
					buttonVariants({ variant: resolvedVariant, size, fullWidth }),
					isLink && "h-auto px-0",
					(disabled || loading) && "opacity-50",
					className,
				)}
				style={[animatedContainerStyle, style as ViewStyle]}
				{...props}
			>
				{/* Inner top-edge highlight — only on filled variants.
				    Sits 1px tall along the top, low-alpha white. This is the
				    "lit from above" cue that makes the button feel like an object
				    rather than a colored rectangle. Renders first so it paints
				    above the background but below the press overlay + content. */}
				{hasInnerHighlight && (
					<View
						pointerEvents="none"
						className="absolute inset-x-0 top-0 h-px bg-overlay-white"
					/>
				)}

				{/* Press-state brightness overlay. Animates opacity 0 → max on
				    press-in. Filled variants darken; bordered/ghost get a
				    primary-tinted overlay. Skipped entirely for link. */}
				{pressOverlay.maxOpacity > 0 && (
					<Animated.View
						pointerEvents="none"
						style={[
							StyleSheet.absoluteFill,
							{ backgroundColor: pressOverlay.color },
							animatedPressOverlayStyle,
						]}
					/>
				)}

				{/* Content — rendered last so it paints on top of both decorative
				    layers. Icons resolve their color from the variant. */}
				{loading ? (
					<ActivityIndicator size="small" color={contentColor} />
				) : (
					<>
						{iconLeft && resolveIcon(iconLeft, resolvedSize, contentColor)}
						{renderButtonChildren(children, resolvedSize, contentColor)}
						{iconRight && resolveIcon(iconRight, resolvedSize, contentColor)}
					</>
				)}
			</AnimatedPressable>
		</TextClassContext.Provider>
	);
});
Button.displayName = "Button";

export type { ButtonProps };
export { Button, buttonTextVariants, buttonVariants };
