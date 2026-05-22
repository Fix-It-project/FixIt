import { ArrowRight, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { PressableScale } from "@/src/components/ui/PressableScale";
import { Colors, radius, space, spacing, useThemeColors } from "@/src/lib/theme";

interface StagePrimaryActionProps {
	readonly label: string;
	readonly onPress: () => void;
	readonly disabled?: boolean;
	readonly pending?: boolean;
	readonly icon?: LucideIcon;
	readonly tint?: string;
	readonly trailing?: ReactNode;
}

export function StagePrimaryAction({
	label,
	onPress,
	disabled,
	pending,
	icon: Icon,
	tint,
	trailing,
}: StagePrimaryActionProps) {
	const themeColors = useThemeColors();
	const fill =
		disabled || pending
			? themeColors.borderDefault
			: (tint ?? themeColors.primary);
	const fg =
		disabled || pending ? themeColors.textMuted : themeColors.onPrimaryHeader;
	const trailingNode =
		trailing ??
		(pending ? null : <ArrowRight size={spacing.icon.sm} color={fg} strokeWidth={2.4} />);

	return (
		<PressableScale
			onPress={onPress}
			disabled={disabled || pending}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled: disabled || pending }}
		>
			<View
				className="flex-1 flex-row items-center justify-between gap-stack-sm rounded-button px-button-x py-control-cta-y"
				style={{ backgroundColor: fill }}
			>
				{pending ? (
					<View style={{ width: space[5] }}>
						<ActivityIndicator size="small" color={fg} />
					</View>
				) : Icon ? (
					<Icon size={spacing.icon.sm} color={fg} strokeWidth={2.4} />
				) : (
					<View style={{ width: space[5] }} />
				)}
				<Text
					variant="buttonLg"
					className="font-google-sans-bold"
					style={{ color: fg }}
				>
					{label}
				</Text>
				<View style={{ width: space[5], alignItems: "flex-end" }}>
					{pending ? null : trailingNode}
				</View>
			</View>
		</PressableScale>
	);
}

interface StageSecondaryActionProps {
	readonly label: string;
	readonly onPress: () => void;
	readonly disabled?: boolean;
	readonly pending?: boolean;
	readonly pendingLabel?: string;
	readonly tone?: "neutral" | "danger" | "success";
	readonly icon?: LucideIcon;
}

export function StageSecondaryAction({
	label,
	onPress,
	disabled,
	pending,
	pendingLabel,
	tone = "neutral",
	icon: Icon,
}: StageSecondaryActionProps) {
	const themeColors = useThemeColors();
	const isDanger = tone === "danger";
	const isSuccess = tone === "success";
	const bg = isDanger
		? `${themeColors.danger}14`
		: isSuccess
			? themeColors.success
			: themeColors.surfaceElevated;
	const fg = isDanger
		? themeColors.danger
		: isSuccess
			? themeColors.onPrimaryHeader
			: themeColors.textPrimary;

	return (
		<PressableScale
			onPress={onPress}
			disabled={disabled || pending}
			accessibilityRole="button"
			accessibilityLabel={label}
			accessibilityState={{ disabled: disabled || pending }}
		>
			<View
				className="w-full flex-row items-center justify-center gap-stack-sm rounded-button px-button-x py-control-cta-y"
				style={{ backgroundColor: bg }}
			>
				{pending ? (
					<ActivityIndicator size="small" color={fg} />
				) : Icon ? (
					<Icon size={spacing.icon.sm} color={fg} strokeWidth={2.4} />
				) : null}
				<Text
					variant="buttonLg"
					className="font-google-sans-bold"
					style={{ color: fg }}
				>
					{pending && pendingLabel ? pendingLabel : label}
				</Text>
			</View>
		</PressableScale>
	);
}

interface StageActionRowProps {
	readonly primary: ReactNode;
	readonly trailing?: ReactNode;
}

export function StageActionRow({ primary, trailing }: StageActionRowProps) {
	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				gap: space[2],
			}}
		>
			<View style={{ flex: 1 }}>{primary}</View>
			{trailing ?? null}
		</View>
	);
}

export const StageActionColors = Colors;
export const StageActionRadius = radius;
