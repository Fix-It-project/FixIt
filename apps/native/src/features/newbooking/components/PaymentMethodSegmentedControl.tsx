import { CreditCard, Wallet } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
	SegmentedControl,
	SegmentedControlItem,
} from "@/src/components/ui/segmented-control";
import { Text } from "@/src/components/ui/text";
import {
	elevation,
	shadowStyle,
	useThemeColors,
} from "@/src/constants/design-tokens";

export type PaymentMethodValue = "cash" | "card";

const OPTIONS = [
	{ value: "cash" as const, Icon: Wallet },
	{ value: "card" as const, Icon: CreditCard },
];

interface PaymentMethodSegmentedControlProps {
	readonly value: PaymentMethodValue | null;
	readonly onChange: (value: PaymentMethodValue) => void;
}

/**
 * Mandatory cash/card selector for the booking final step. Mirrors
 * `ThemeSegmentedControl`; `value === null` until the user picks one.
 */
export function PaymentMethodSegmentedControl({
	value,
	onChange,
}: PaymentMethodSegmentedControlProps) {
	const { t } = useTranslation("booking");
	const themeColors = useThemeColors();

	return (
		<SegmentedControl
			tone="surface"
			style={{ backgroundColor: themeColors.surfaceElevated }}
		>
			{OPTIONS.map(({ value: optionValue, Icon }) => {
				const isActive = value === optionValue;

				return (
					<SegmentedControlItem
						key={optionValue}
						onPress={() => onChange(optionValue)}
						style={{
							backgroundColor: isActive
								? themeColors.surfaceBase
								: "transparent",
							...(isActive
								? shadowStyle(elevation.flat, {
										shadowColor: themeColors.shadow,
									})
								: undefined),
						}}
					>
						<View className="flex-row items-center justify-center gap-control-segmented">
							<Icon
								size={16}
								strokeWidth={1.8}
								color={isActive ? themeColors.primary : themeColors.textMuted}
							/>
							<Text
								variant="bodySm"
								className="font-medium text-sm"
								style={{
									color: isActive
										? themeColors.primary
										: themeColors.textMuted,
								}}
							>
								{t(`payment.${optionValue}` as Parameters<typeof t>[0])}
							</Text>
						</View>
					</SegmentedControlItem>
				);
			})}
		</SegmentedControl>
	);
}
