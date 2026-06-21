import { View, type ViewProps } from "react-native";
import {
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/constants/design-tokens";
import { cn } from "@/src/lib/utils";

/**
 * SINGLE SOURCE for the card surface look: rounded `card` radius + `bg-card`
 * fill (gray/white per active theme) + NO outline. Use `<Card>` for plain
 * `<View>` cards; for INTERACTIVE cards (TouchableOpacity/PressableScale/Pressable)
 * use `className={cn(CARD_BASE, "…")}`. Change card radius/fill/border HERE once.
 */
export const CARD_BASE = "rounded-card bg-card";

interface CardProps extends ViewProps {
	/** Adds a raised drop shadow (theme-aware shadow color). */
	elevated?: boolean;
	className?: string;
}

/**
 * Shared card surface — single source of truth for card STRUCTURE.
 *
 * Defaults: `bg-card` fill (gray/white per active theme) + `rounded-card`, NO
 * outline (the app does not use card borders). Pass `elevated` for a drop shadow,
 * and override radius/padding/etc. via `className` (tailwind-merge resolves
 * conflicts, e.g. `className="rounded-[14px] p-card"`).
 *
 * To restyle EVERY card (radius, shadow, border, fill) change it here once.
 */
export function Card({
	elevated,
	className,
	style,
	...props
}: Readonly<CardProps>) {
	const themeColors = useThemeColors();
	return (
		<View
			className={cn(CARD_BASE, className)}
			style={[
				elevated
					? shadowStyle(elevation.raised, { shadowColor: themeColors.shadow })
					: null,
				style,
			]}
			{...props}
		/>
	);
}
