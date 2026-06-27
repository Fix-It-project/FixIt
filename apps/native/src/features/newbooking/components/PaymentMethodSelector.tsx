import { Banknote, CreditCard, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group";
import { Text } from "@/src/components/ui/text";
import { space, spacing, useThemeColors } from "@/src/constants/design-tokens";
import { PaymentBrandMarks } from "./PaymentBrandMarks";

export type PaymentMethodValue = "cash" | "card";

interface PaymentMethodSelectorProps {
	readonly value: PaymentMethodValue | null;
	readonly onChange: (value: PaymentMethodValue) => void;
}

interface Option {
	readonly value: PaymentMethodValue;
	readonly label: string;
	readonly icon: LucideIcon;
	readonly trailing: ReactNode;
}

/**
 * Mandatory cash/card selector for the booking final step. Plain material-style
 * radio rows — no cards, no helper text (the label is self-explanatory). The
 * Card row carries the accepted network marks.
 */
export function PaymentMethodSelector({
	value,
	onChange,
}: PaymentMethodSelectorProps) {
	const { t } = useTranslation("booking");
	const colors = useThemeColors();

	const options: Option[] = [
		{
			value: "card",
			label: t("payment.card"),
			icon: CreditCard,
			trailing: <PaymentBrandMarks />,
		},
		{
			value: "cash",
			label: t("payment.cash"),
			icon: Banknote,
			trailing: null,
		},
	];

	return (
		<RadioGroup
			value={value ?? ""}
			onValueChange={(next) => onChange(next as PaymentMethodValue)}
		>
			{options.map((option) => (
				<Pressable
					key={option.value}
					accessibilityRole="radio"
					accessibilityState={{ selected: value === option.value }}
					onPress={() => onChange(option.value)}
					style={{
						flexDirection: "row",
						alignItems: "center",
						gap: space[3],
						paddingVertical: space[3],
					}}
				>
					<RadioGroupItem value={option.value} aria-label={option.label} />
					<option.icon
						size={spacing.icon.sm}
						color={colors.textMuted}
						strokeWidth={1.8}
					/>
					<Text
						variant="body"
						className="font-google-sans-bold"
						style={{ flex: 1, color: colors.textPrimary }}
					>
						{option.label}
					</Text>
					{option.trailing}
				</Pressable>
			))}
		</RadioGroup>
	);
}
