type FormattableAddress = {
	readonly city: string;
	readonly street: string;
	readonly building_no?: string | null;
	readonly apartment_no?: string | null;
};

export function formatAddress(
	address: FormattableAddress | null | undefined,
	fallback = "No location selected",
): string {
	if (!address) return fallback;

	return [address.city, address.street, address.building_no]
		.filter(Boolean)
		.join(", ");
}
