export const DEFAULT_CURRENCY = "EGP";

export function formatCurrency(
	amount: number,
	currency = DEFAULT_CURRENCY,
): string {
	return `${amount.toLocaleString()} ${currency}`;
}

export function formatAmount(amount: number): string {
	return amount.toLocaleString();
}
